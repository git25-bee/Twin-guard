import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import { TOPOLOGY_EDGES } from '../data/initialNodes';

// Register cola layout plugin
try {
  cytoscape.use(cola);
} catch (e) {
  // Plugin registered
}

export default function DigitalTwinGraph({ devices = [], onNodeSelect, selectedNodeId }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  // Map status to visual colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE':
      case 'SAFE': return '#22C55E';
      case 'UNSTABLE':
      case 'UNDER_MONITORING': return '#F59E0B';
      case 'SUSPICIOUS': return '#F97316';
      case 'UNDER_ATTACK':
      case 'COMPROMISED': return '#EF4444';
      case 'DEFENDED': return '#3B82F6';
      case 'ISOLATED':
      case 'OFFLINE': return '#64748B';
      default: return '#22C55E';
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean node names to avoid text overlap
    const elementsNodes = devices.map((dev) => {
      const cleanName = dev.name || dev.id;
      return {
        data: {
          id: dev.id,
          name: cleanName,
          device_type: dev.device_type,
          hospital_department: dev.hospital_department || 'General Ward',
          status: dev.status,
          risk_score: dev.risk_score,
          color: getStatusColor(dev.status),
          is_attack: dev.status === 'UNDER_ATTACK' || dev.status === 'COMPROMISED',
          is_isolated: dev.status === 'ISOLATED',
          is_defended: dev.status === 'DEFENDED'
        }
      };
    });

    // Build edges from TOPOLOGY_EDGES + dynamic links
    const nodeIds = new Set(devices.map(d => d.id));
    const edgesList = [...TOPOLOGY_EDGES];

    devices.forEach((dev) => {
      if (dev.id !== 'node-internet' && dev.id !== 'node-firewall' && dev.id !== 'node-server') {
        const hasEdge = edgesList.some(e => e.source === dev.id || e.target === dev.id);
        if (!hasEdge) {
          edgesList.push({
            source: "node-server",
            target: dev.id,
            label: ""
          });
        }
      }
    });

    const elementsEdges = edgesList
      .filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target))
      .map((edge, idx) => ({
        data: {
          id: `edge-${idx}`,
          source: edge.source,
          target: edge.target,
          label: '' // Clear edge text labels to prevent text clutter and overlap
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
            'label': 'data(name)',
            'background-color': 'data(color)',
            'color': '#0F172A',
            'font-size': '11px',
            'font-weight': '700',
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'text-wrap': 'wrap',
            'text-max-width': 100,
            'text-background-color': '#FFFFFF',
            'text-background-opacity': 0.9,
            'text-background-padding': '4px',
            'text-background-shape': 'roundrectangle',
            'width': 48,
            'height': 48,
            'border-width': 3,
            'border-color': '#FFFFFF',
            'overlay-opacity': 0,
            'transition-property': 'background-color, border-color, bounds',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'node[status = "UNDER_ATTACK"], node[status = "COMPROMISED"]',
          style: {
            'border-color': '#EF4444',
            'border-width': 5,
            'width': 56,
            'height': 56
          }
        },
        {
          selector: 'node[status = "DEFENDED"]',
          style: {
            'border-color': '#2563EB',
            'border-width': 4
          }
        },
        {
          selector: 'node[status = "ISOLATED"], node[status = "OFFLINE"]',
          style: {
            'background-color': '#94A3B8',
            'border-color': '#475569',
            'border-style': 'dashed',
            'opacity': 0.75
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#CBD5E1',
            'target-arrow-color': '#CBD5E1',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.85
          }
        },
        {
          selector: 'edge[source = "node-internet"]',
          style: {
            'line-color': '#2563EB',
            'target-arrow-color': '#2563EB'
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 50,
        spacingFactor: 2.2,
        avoidOverlap: true,
        roots: '#node-internet'
      }
    });

    cyRef.current = cy;

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data();
      const dev = devices.find((d) => d.id === nodeData.id || d.name === nodeData.name || d.name.toLowerCase() === (nodeData.id || '').toLowerCase());
      if (dev && onNodeSelect) {
        onNodeSelect(dev);
      } else if (onNodeSelect) {
        onNodeSelect({
          id: nodeData.id,
          name: nodeData.name,
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

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [devices]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px' }}>
      <div ref={containerRef} className="cytoscape-container" style={{ width: '100%', height: '100%', minHeight: '520px' }} />
      
      {/* Topology Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '0.6rem 0.85rem',
        fontSize: '0.75rem',
        color: '#0F172A',
        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.08)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        gap: '1rem',

        alignItems: 'center',
        zIndex: 10
      }}>
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

