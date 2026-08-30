import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { TOPOLOGY_EDGES } from '../data/initialNodes';
import { getDeviceImageUri } from '../utils/deviceIcons';

export default function DigitalTwinGraph({ devices = [], onNodeSelect, selectedNodeId }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build preset node layout with Core Hospital Server dead center in the middle
    const serverNodeId = 'node-server';
    const firewallNodeId = 'node-firewall';
    const internetNodeId = 'node-internet';

    const otherNodes = devices.filter(
      (d) => d.id !== serverNodeId && d.id !== firewallNodeId && d.id !== internetNodeId
    );

    const presetPositions = {};
    presetPositions[serverNodeId] = { x: 0, y: 0 }; // Core Hospital Server in the middle!
    presetPositions[firewallNodeId] = { x: -140, y: -250 };
    presetPositions[internetNodeId] = { x: -320, y: -320 };

    const totalOthers = otherNodes.length;
    const radiusX = 420;
    const radiusY = 280;

    otherNodes.forEach((dev, idx) => {
      // Start radial distribution from top-right around the central server
      const angle = (idx * (2 * Math.PI / Math.max(totalOthers, 1))) - (Math.PI / 3);
      presetPositions[dev.id] = {
        x: Math.round(Math.cos(angle) * radiusX),
        y: Math.round(Math.sin(angle) * radiusY)
      };
    });

    const elementsNodes = devices.map((dev) => {
      const cleanName = dev.name || dev.id;
      const dept = dev.hospital_department || (dev.device_type || 'Device').split('/')[0].trim();
      const miniatureLabel = `${cleanName}\n(${dept})`;
      const bgImage = getDeviceImageUri(dev);
      const pos = presetPositions[dev.id] || { x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 400 };

      return {
        data: {
          id: dev.id,
          name: cleanName,
          miniatureLabel: miniatureLabel,
          rawName: cleanName,
          bgImage: bgImage,
          device_type: dev.device_type,
          hospital_department: dev.hospital_department || 'General Ward',
          status: dev.status,
          risk_score: dev.risk_score,
          is_attack: dev.status === 'UNDER_ATTACK' || dev.status === 'COMPROMISED',
          is_isolated: dev.status === 'ISOLATED',
          is_defended: dev.status === 'DEFENDED'
        },
        position: pos
      };
    });

    const nodeIds = new Set(devices.map((d) => d.id));
    const edgesList = [...TOPOLOGY_EDGES];

    devices.forEach((dev) => {
      if (dev.id !== internetNodeId && dev.id !== firewallNodeId && dev.id !== serverNodeId) {
        const hasEdge = edgesList.some((e) => e.source === dev.id || e.target === dev.id);
        if (!hasEdge) {
          edgesList.push({
            source: serverNodeId,
            target: dev.id,
            label: ''
          });
        }
      }
    });

    const elementsEdges = edgesList
      .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
      .map((edge, idx) => ({
        data: {
          id: `edge-${idx}`,
          source: edge.source,
          target: edge.target,
          label: ''
        }
      }));

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...elementsNodes, ...elementsEdges],
      style: [
        {
          selector: 'node',
          style: {
            'shape': 'rectangle',
            'width': 90,
            'height': 90,
            'background-opacity': 0, // Transparent background box!
            'background-image': 'data(bgImage)',
            'background-fit': 'contain',
            'background-clip': 'none',
            'border-width': 0,
            'label': 'data(miniatureLabel)',
            'color': '#000000', // Pure pitch-black darkened font!
            'font-size': '13px',
            'font-weight': '800', // Extra bold text!
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 8,
            'text-wrap': 'wrap',
            'text-max-width': 160,
            'line-height': 1.2,
            'text-background-color': '#FFFFFF',
            'text-background-opacity': 0.92,
            'text-background-padding': '4px',
            'text-background-shape': 'roundrectangle',
            'text-border-color': '#CBD5E1',
            'text-border-width': 1,
            'text-border-opacity': 0.8,
            'overlay-opacity': 0,
            'transition-property': 'opacity',
            'transition-duration': '0.3s'
          }
        },
        // Highlight server in middle with larger miniature size
        {
          selector: 'node[id = "node-server"]',
          style: {
            'width': 115,
            'height': 115,
            'font-size': '14px',
            'text-margin-y': 12
          }
        },
        {
          selector: 'node[status = "UNDER_ATTACK"], node[status = "COMPROMISED"]',
          style: {
            'width': 105,
            'height': 105,
            'border-width': 4,
            'border-color': '#EF4444',
            'border-style': 'solid',
            'background-color': '#FEF2F2',
            'background-opacity': 0.75,
            'color': '#991B1B',
            'text-background-color': '#FEF2F2',
            'text-border-color': '#EF4444'
          }
        },
        {
          selector: 'node[status = "DEFENDED"]',
          style: {
            'width': 100,
            'height': 100,
            'border-width': 3,
            'border-color': '#2563EB',
            'background-color': '#EFF6FF',
            'background-opacity': 0.6,
            'color': '#1E40AF',
            'text-background-color': '#EFF6FF',
            'text-border-color': '#3B82F6'
          }
        },
        {
          selector: 'node[status = "ISOLATED"], node[status = "OFFLINE"]',
          style: {
            'opacity': 0.5,
            'color': '#334155'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2.5,
            'line-color': '#3B82F6',
            'target-arrow-color': '#3B82F6',
            'target-arrow-shape': 'circle',
            'curve-style': 'bezier',
            'opacity': 0.8
          }
        },
        {
          selector: 'edge[source = "node-internet"], edge[target = "node-internet"]',
          style: {
            'width': 3,
            'line-color': '#0284C7',
            'target-arrow-color': '#0284C7'
          }
        }
      ],
      layout: {
        name: 'preset',
        fit: true,
        padding: 40
      }
    });

    cyRef.current = cy;

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data();
      const dev = devices.find(
        (d) =>
          d.id === nodeData.id ||
          d.name === nodeData.rawName ||
          d.name === nodeData.name ||
          d.name.toLowerCase() === (nodeData.id || '').toLowerCase()
      );
      if (dev && onNodeSelect) {
        onNodeSelect(dev);
      } else if (onNodeSelect) {
        onNodeSelect({
          id: nodeData.id,
          name: nodeData.rawName || nodeData.name || nodeData.id,
          device_type: nodeData.device_type || 'Core Infrastructure Node',
          hospital_department: nodeData.hospital_department || 'IT Infrastructure',
          status: nodeData.status || 'ONLINE',
          risk_score: nodeData.risk_score || 15,
          cpu_usage: 25,
          memory_usage: 40,
          network_traffic: 200,
          detected_threat: nodeData.is_attack ? 'Active Malicious Payload' : 'None'
        });
      }
    });

    // Auto fit canvas space comfortably
    setTimeout(() => {
      if (cyRef.current) {
        cyRef.current.fit(undefined, 35);
      }
    }, 100);

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [devices]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '580px' }}>
      <div
        ref={containerRef}
        className="cytoscape-container"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '580px',
          borderRadius: '12px',
          background: `
            radial-gradient(circle at center, #FFFFFF 0%, #F8FAFC 70%, #F1F5F9 100%),
            linear-gradient(to right, rgba(203, 213, 225, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(203, 213, 225, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px'
        }}
      />

      {/* Topology Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #CBD5E1',
          borderRadius: '8px',
          padding: '0.6rem 0.9rem',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#020617',
          boxShadow: '0 4px 18px rgba(15, 23, 42, 0.08)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          gap: '1.1rem',
          alignItems: 'center',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E' }}></span> Online / Safe
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }}></span> Monitoring / Unstable
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }}></span> Under Attack
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3B82F6' }}></span> Defended
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#64748B' }}></span> Isolated / Offline
        </div>
      </div>
    </div>
  );
}
