import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, CheckCircle2, Shield, Activity, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await api.getReportsSummary();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDownloadDoc = () => {
    if (!report) return;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>TwinGuard SOC Executive Incident Report</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; background-color: #ffffff; color: #1e293b; padding: 30px; }
          h1 { color: #1e3a8a; font-size: 24pt; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 5px; }
          h2 { color: #1e40af; font-size: 16pt; margin-top: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
          .header-meta { color: #64748b; font-size: 10pt; margin-bottom: 25px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11pt; }
          th { background-color: #1e3a8a; color: #ffffff; padding: 10px; text-align: left; font-weight: bold; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .badge-success { background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
          .badge-danger { background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
          .footer { margin-top: 40px; font-size: 9pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <h1>🛡️ TwinGuard Smart Hospital Cybersecurity Report</h1>
        <div class="header-meta">
          <strong>Generated At:</strong> ${report.generated_at || new Date().toLocaleString()} &nbsp;|&nbsp; 
          <strong>Hospital Facility:</strong> TwinGuard Central Hospital &nbsp;|&nbsp;
          <strong>Classification:</strong> CONFIDENTIAL - SOC EXECUTIVE REPORT
        </div>

        <h2>1. Executive SOC Performance Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Metric Description</th>
              <th>Calculated Value</th>
              <th>Operational Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Total Simulated Attacks Logged</strong></td>
              <td>${report.total_attacks || 0} Attacks</td>
              <td><span class="badge-danger">AUDITED</span></td>
            </tr>
            <tr>
              <td><strong>Successful Automated Defenses</strong></td>
              <td>${report.successful_defenses || 0} Defenses</td>
              <td><span class="badge-success">ACTIVE</span></td>
            </tr>
            <tr>
              <td><strong>Defense Mitigation Success Rate</strong></td>
              <td><strong>${report.defense_success_rate || '100%'}</strong></td>
              <td><span class="badge-success">OPTIMAL</span></td>
            </tr>
            <tr>
              <td><strong>Mean Time to Defend (MTTD)</strong></td>
              <td>${report.avg_response_time_ms || 320} ms</td>
              <td><span class="badge-success">FAST</span></td>
            </tr>
            <tr>
              <td><strong>Overall Hospital Risk Score</strong></td>
              <td><strong>${report.avg_risk_score || 15}/100</strong></td>
              <td>NORMAL BASELINE</td>
            </tr>
            <tr>
              <td><strong>Most Targeted Infrastructure</strong></td>
              <td>${report.most_targeted_device || 'Core Hospital Server'}</td>
              <td>PRIMARY VECTOR</td>
            </tr>
            <tr>
              <td><strong>Primary Attack Vector</strong></td>
              <td>${report.most_common_attack || 'Ransomware'}</td>
              <td>HIGH SEVERITY</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Active Hospital Asset Inventory & Threat Status</h2>
        <table>
          <thead>
            <tr>
              <th>Device Name</th>
              <th>Department / Location</th>
              <th>Current Status</th>
              <th>Risk Score</th>
            </tr>
          </thead>
          <tbody>
            ${(report.active_devices || []).map(d => `
              <tr>
                <td><strong>${d.name}</strong> (${d.id})</td>
                <td>${d.department}</td>
                <td>${d.status}</td>
                <td>${d.risk_score}/100</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>3. Recommended Cybersecurity Action Plan</h2>
        <p>1. Maintain continuous network micro-segmentation across ICU and Data Center VLANs.<br>
           2. Enforce automated database snapshot locks for Patient Database (PHI) during elevated risk.<br>
           3. Perform weekly threat vector simulations using TwinGuard Digital Twin platform.</p>

        <div class="footer">
          Official Digital Twin SOC Audit Document &bull; TwinGuard Hospital Cybersecurity Platform &bull; Page 1 of 1
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TwinGuard_SOC_Report_${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText color="var(--accent-green)" size={24} /> SOC Incident & System Performance Reports
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Executive incident summaries and statistical analytics report for security leadership.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchReport} disabled={loading}>
            <RefreshCw size={14} /> Refresh Report
          </button>
          <button className="btn btn-primary" onClick={handleDownloadDoc} disabled={!report}>
            <Download size={14} /> Download Executive .DOC Report
          </button>

        </div>
      </div>

      {report && (
        <>
          {/* Executive Stats Cards */}
          <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Attacks Simulated</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-red)', marginTop: '0.25rem' }}>
                {report.total_attacks}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mitigation Success Rate</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-green)', marginTop: '0.25rem' }}>
                {report.defense_success_rate}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mean Response Time</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-blue)', marginTop: '0.25rem' }}>
                {report.avg_response_time_ms} ms
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Most Targeted Asset</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-purple)', marginTop: '0.5rem' }}>
                {report.most_targeted_device}
              </div>
            </div>
          </div>

          {/* Full Printable Summary Document Card */}
          <div className="card" style={{ border: '1px solid var(--border-color)', padding: '2rem' }}>
            <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{report.title}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Generated on: {report.generated_at} • TwinGuard Hospital SOC System
                </div>
              </div>
              <span className="brand-badge" style={{ background: 'var(--accent-green)' }}>ENTERPRISE READY</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent-blue)' }}>
                  SOC Key Metrics & Performance
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                  <li><strong>Total Simulated Cyber Attacks:</strong> {report.total_attacks}</li>
                  <li><strong>Successful Automated Defenses:</strong> {report.successful_defenses}</li>
                  <li><strong>Air-Gapped Isolated Devices:</strong> {report.isolated_devices}</li>
                  <li><strong>Average Incident Mitigation Speed:</strong> {report.avg_response_time_ms} ms</li>
                  <li><strong>Average Overall Hospital Risk Score:</strong> {report.avg_risk_score}/100</li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent-purple)' }}>
                  Threat Vectors & Asset Exposure
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                  <li><strong>Primary Target Asset:</strong> {report.most_targeted_device}</li>
                  <li><strong>Primary Cyber Attack Vector:</strong> {report.most_common_attack}</li>
                  <li><strong>AI Engine Recommendation Confidence:</strong> 96.4%</li>
                  <li><strong>Database Logs Engine:</strong> MySQL + SQLite Dual Persistence</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
