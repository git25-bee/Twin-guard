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

  // Map status to visual colors and styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'SAFE': return '#10B981';
      case 'UNDER_MONITORING': return '#F59E0B';
      case 'SUSPICIOUS': return '#F97316';
      case 'UNDER_ATTACK': return '#EF4444';
      case 'DEFENDED': return '#3B82F6';
      case 'ISOLATED': return '#4B5563';
      default: return '#10B981';
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert devices array to Cytoscape node elements
    const elementsNodes = devices.map((dev) => ({
      data: {
        id: dev.id,
        name: dev.name,
        device_type: dev.device_type,
        status: dev.status,
        risk_score: dev.risk_score,
        color: getStatusColor(dev.status),
        is_attack: dev.status === 'UNDER_ATTACK',
        is_isolated: dev.status === 'ISOLATED',
        is_defended: dev.status === 'DEFENDED'
      }
    }));

    // Convert topology edges to Cytoscape edge elements
    const elementsEdges = TOPOLOGY_EDGES.map((edge, idx) => ({
      data: {
        id: `edge-${idx}`,
        source: edge.source,
        target: edge.target,
        label: edge.label
      }
    }));

    // Destroy existing instance if any
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
            'color': '#F8FAFC',
            'font-size': '12px',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'width': 44,
            'height': 44,
            'border-width': 3,
            'border-color': '#1E293B',
            'overlay-opacity': 0,
            'transition-property': 'background-color, border-color, bounds',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'node[status = "UNDER_ATTACK"]',
          style: {
            'border-color': '#EF4444',
            'border-width': 5,
            'shadow-blur': 25,
            'shadow-color': '#EF4444',
            'shadow-opacity': 0.9,
            'width': 52,
            'height': 52
          }
        },
        {
          selector: 'node[status = "DEFENDED"]',
          style: {
            'border-color': '#3B82F6',
            'border-width': 4,
            'shadow-blur': 20,
            'shadow-color': '#3B82F6',
            'shadow-opacity': 0.8
          }
        },
        {
          selector: 'node[status = "ISOLATED"]',
          style: {
            'background-color': '#334155',
            'border-color': '#64748B',
            'border-style': 'dashed',
            'opacity': 0.5
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#334155',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.7
          }
        },
        {
          selector: 'edge[source = "node-internet"]',
          style: {
            'line-color': '#3B82F6',
            'target-arrow-color': '#3B82F6'
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 40,
        spacingFactor: 1.25,
        roots: '#node-internet'
      }
    });

    cyRef.current = cy;

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data();
      const dev = devices.find((d) => d.id === nodeData.id);
      if (dev && onNodeSelect) {
        onNodeSelect(dev);
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [devices]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} className="cytoscape-container" />
      
      {/* Topology Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.6rem 0.85rem',
        fontSize: '0.75rem',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }}></span> Safe
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }}></span> Monitoring
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }}></span> Under Attack
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3B82F6' }}></span> Defended
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4B5563' }}></span> Isolated
        </div>
      </div>
    </div>
  );
}
