import { memo, useEffect, useRef, useState } from "react";
import { useEuiTheme } from "@elastic/eui";
import Sigma from "sigma";
import { MultiGraph as Graph } from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { NetworkValue } from "../../../../types/visuals";

interface NetworkProps {
  data: NetworkValue;
  key: string;
}

const NetworkComponent = ({ data, key }: NetworkProps) => {
  const { colorMode } = useEuiTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!containerRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }

    const graph = new Graph();

    data.nodes.forEach((n) => {
      graph.addNode(n.id, {
        label: n.id,
        size: n.size ?? 4,
        color: n.color ?? (colorMode === "LIGHT" ? "#444" : "#ddd"),
        x: Math.random(),
        y: Math.random(),
      });
    });

    data.links.forEach((l) => {
      if (graph.hasNode(l.source) && graph.hasNode(l.target)) {
        graph.addEdge(l.source, l.target, {
          size: l.distance ?? 0,
          color: colorMode === "LIGHT" ? "#888" : "#aaa",
        });
      }
    });

    forceAtlas2.assign(graph, { iterations: 200, settings: { gravity: 1, strongGravityMode: true } });

    const nodes = graph.nodes();
    if (nodes.length) {
      let xSum = 0,
        ySum = 0;
      nodes.forEach((n: string) => {
        const { x, y } = graph.getNodeAttributes(n);
        xSum += x;
        ySum += y;
      });
      const cx = xSum / nodes.length;
      const cy = ySum / nodes.length;

      let maxDist = 0;
      nodes.forEach((n: string) => {
        const attrs = graph.getNodeAttributes(n);
        const dx = attrs.x - cx;
        const dy = attrs.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) maxDist = dist;
      });

      const scale = 100 / (maxDist || 1);
      nodes.forEach((n: string) => {
        const attrs = graph.getNodeAttributes(n);
        graph.setNodeAttribute(n, "x", (attrs.x - cx) * scale);
        graph.setNodeAttribute(n, "y", (attrs.y - cy) * scale);
      });
    }

    const sigma = new Sigma(graph, containerRef.current, {
      renderLabels: true,
      minCameraRatio: 0.1,
      maxCameraRatio: 10,
      zIndex: true,
    });

    sigmaRef.current = sigma;

    requestAnimationFrame(() => {
      sigma.getCamera().animatedReset({ duration: 500 });
    });

    return () => {
      sigma.kill();
      sigmaRef.current = null;
    };
  }, [data, dimensions, colorMode]);

  return (
    <div
      ref={containerRef}
      id={`sigma-network-${key}`}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: colorMode === "LIGHT" ? "#ffffff" : "#1D1E24",
        borderRadius: 8,
      }}
    />
  );
};

export const Network = memo(NetworkComponent);