import React, { useState, useEffect } from 'react';
import { Server, Plus, Edit2, Trash2, Power, ShieldAlert, CheckCircle, Lock, RefreshCw, FileText, Search } from 'lucide-react';
import { api } from '../services/api';

export default function DeviceManagement({ devices = [], onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    device_type: 'Clinical Workstation',
    hospital_department: 'ICU Ward',
    ip_address: '',
    mac_address: '00:1A:2B:3C:4D:5E',
    os_firmware: 'TwinGuard OS v2.1',
    network_segment: 'VLAN-10',
    location: 'Main Building',
    connection_protocol: 'MQTT',
    status: 'ONLINE'
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      const logs = await api.getAuditLogs();
      setAuditLogs(logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [devices]);

  const handleOpenAdd = () => {
    setEditingDevice(null);
    const randomId = `ICU-MONITOR-${Math.floor(Math.random()*90+10)}`;
    setFormData({
      id: randomId,
      name: `Patient Monitor ${Math.floor(Math.random()*90+10)}`,
      device_type: 'Clinical Workstation',
      hospital_department: 'ICU Ward',
      ip_address: `192.168.${Math.floor(Math.random()*3+1)}.${Math.floor(Math.random()*200+10)}`,
      mac_address: `00:1A:2B:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}`,
      os_firmware: 'TwinGuard OS v2.1',
      network_segment: 'VLAN-10',
      location: 'Main Building - Room 104',
      connection_protocol: 'MQTT',
      status: 'ONLINE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (dev) => {
    setEditingDevice(dev);
    setFormData({
      id: dev.id,
      name: dev.name,
      device_type: dev.device_type,
      hospital_department: dev.hospital_department || 'ICU Ward',
      ip_address: dev.ip_address,
      mac_address: dev.mac_address || '00:1A:2B:3C:4D:5E',
      os_firmware: dev.os_firmware || 'TwinGuard OS v2.1',
      network_segment: dev.network_segment || 'VLAN-10',
      location: dev.location || 'Main Building',
      connection_protocol: dev.connection_protocol || 'MQTT',
      status: dev.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingDevice) {
        await api.updateDevice(editingDevice.id, formData);
      } else {
        await api.addDevice(formData);
      }
      setModalOpen(false);
      if (onRefresh) await onRefresh();
      await fetchAuditLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dev) => {
    if (window.confirm(`Are you sure you want to delete device '${dev.name}'?`)) {
      try {
        await api.deleteDevice(dev.id);
        if (onRefresh) await onRefresh();
        await fetchAuditLogs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleStatus = async (dev) => {
    const nextStatus = dev.status === 'ISOLATED' ? 'ONLINE' : 'ISOLATED';
    try {
      await api.updateDevice(dev.id, { status: nextStatus, defense_action: nextStatus === 'ISOLATED' ? 'Air-gapped by Admin' : 'None' });
      if (onRefresh) await onRefresh();
      await fetchAuditLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const infraKeywords = ['server', 'firewall', 'gateway', 'database', 'ehr', 'phi', 'workstation', 'node', 'wan', 'dmz'];
  
  const filteredDevices = devices.filter(d => {
    const isInfra = infraKeywords.some(k => 
      (d.device_type || '').toLowerCase().includes(k) || 
      (d.name || '').toLowerCase().includes(k) ||
      (d.id || '').toLowerCase().includes(k)
    );
    const matchesSearch = (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.device_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.ip_address || '').includes(searchQuery);

    return (isInfra || devices.length <= 4) && matchesSearch;
  });


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server color="var(--accent-blue)" size={24} /> Admin Hospital Device Management & Registration
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            SOC Administrative controls to register, edit, monitor, disable, or delete hospital infrastructure devices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
          </div>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Register New Device
          </button>
        </div>
      </div>

      {/* Device Management Table */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Active Hospital Devices ({filteredDevices.length})</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Device ID & Name</th>
                <th>Type & Department</th>
                <th>IP & MAC Address</th>
                <th>OS & Network Segment</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((dev) => (
                <tr key={dev.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{dev.name}</div>
                    <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--accent-blue)' }}>{dev.id}</div>
                  </td>
                  <td>
                    <div>{dev.device_type}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dev.hospital_department || 'ICU Ward'}</div>
                  </td>
                  <td>
                    <div className="font-mono">{dev.ip_address}</div>
                    <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dev.mac_address || '00:1A:2B:3C:4D:5E'}</div>
                  </td>
                  <td>
                    <div>{dev.os_firmware || 'TwinGuard OS v2.1'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>{dev.network_segment || 'VLAN-10'}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${dev.status}`}>{dev.status}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: dev.risk_score > 70 ? 'var(--accent-red)' : 'var(--text-main)' }}>
                    {dev.risk_score}/100
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleOpenEdit(dev)}
                        title="Edit device details"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        className={`btn ${dev.status === 'ISOLATED' ? 'btn-success' : 'btn-secondary'}`}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleToggleStatus(dev)}
                        title={dev.status === 'ISOLATED' ? "Re-enable device" : "Disable/Air-gap device"}
                      >
                        <Power size={13} /> {dev.status === 'ISOLATED' ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleDelete(dev)}
                        title="Delete device"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No devices match your search criteria. Click "Register New Device" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Audit Log Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--accent-purple)" /> Admin SOC Audit Log History
          </h3>
          <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={fetchAuditLogs}>
            <RefreshCw size={12} /> Refresh Audit Log
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Timestamp</th>
                <th>Admin Action</th>
                <th>Details</th>
                <th>User / Operator</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono" style={{ color: 'var(--text-muted)' }}>#{log.id}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{log.timestamp}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{log.action}</td>
                  <td>{log.details}</td>
                  <td className="font-mono" style={{ color: 'var(--text-muted)' }}>{log.user || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Device Registration Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
              {editingDevice ? 'Edit Registered Device Details' : 'Register New Hospital Infrastructure Device'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Device ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICU-MONITOR-01"
                    value={formData.id}
                    disabled={!!editingDevice}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Device Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bedside Patient Monitor"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Device Type Category
                  </label>
                  <select
                    value={formData.device_type}
                    onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  >
                    <option value="Clinical Workstation">Clinical Workstation</option>
                    <option value="Critical Medical Imaging">Critical Medical Imaging</option>
                    <option value="Infusion Pumps & Monitors">Infusion Pumps & Monitors</option>
                    <option value="Core Infrastructure">Core Infrastructure</option>
                    <option value="PHI / SQL Storage">PHI / SQL Storage</option>
                    <option value="Electronic Health Records">Electronic Health Records</option>
                    <option value="Medication Dispenser">Medication Dispenser</option>
                    <option value="Pathology Analyzer">Pathology Analyzer</option>
                    <option value="WAN Gateway">WAN Gateway</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Hospital Department
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICU Ward / Pediatrics"
                    value={formData.hospital_department}
                    onChange={(e) => setFormData({ ...formData, hospital_department: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    IP Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="192.168.2.105"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    MAC Address
                  </label>
                  <input
                    type="text"
                    placeholder="00:1A:2B:3C:4D:5E"
                    value={formData.mac_address}
                    onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    OS / Firmware
                  </label>
                  <input
                    type="text"
                    placeholder="TwinGuard OS v2.1"
                    value={formData.os_firmware}
                    onChange={(e) => setFormData({ ...formData, os_firmware: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Network Segment (VLAN)
                  </label>
                  <input
                    type="text"
                    placeholder="VLAN-10"
                    value={formData.network_segment}
                    onChange={(e) => setFormData({ ...formData, network_segment: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Connection Protocol
                  </label>
                  <select
                    value={formData.connection_protocol}
                    onChange={(e) => setFormData({ ...formData, connection_protocol: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  >
                    <option value="MQTT">MQTT Telemetry Protocol</option>
                    <option value="HTTP / REST">HTTP / REST API Stream</option>
                    <option value="CoAP">CoAP IoT Protocol</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="UNSTABLE">UNSTABLE</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="ISOLATED">ISOLATED</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Registering...' : editingDevice ? 'Save Changes' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
