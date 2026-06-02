import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { SFDPoint, BMDPoint } from "@/types";

interface SFDBMDChartProps {
  sfd: SFDPoint[];
  bmd: BMDPoint[];
  totalLength: number;
}

const MARGIN = { top: 20, right: 20, bottom: 20, left: 50 };

export function SFDBMDChart({ sfd, bmd, totalLength }: SFDBMDChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const el = entries[0];
      if (el) {
        setSize({ width: el.contentRect.width, height: el.contentRect.height });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !sfd.length || !bmd.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = size;
    const halfH = (height - 10) / 2;

    const xScale = d3.scaleLinear()
      .domain([0, totalLength])
      .range([MARGIN.left, width - MARGIN.right]);

    // --- SFD (top half) ---
    const sfdExtent = d3.extent(sfd, (d) => d.V) as [number, number];
    const yScaleSFD = d3.scaleLinear()
      .domain([Math.min(sfdExtent[0], -0.1), Math.max(sfdExtent[1], 0.1)])
      .nice()
      .range([halfH - MARGIN.top, MARGIN.top]);

    const sfdArea = d3.area<SFDPoint>()
      .x((d) => xScale(d.x))
      .y0(yScaleSFD(0))
      .y1((d) => yScaleSFD(d.V))
      .curve(d3.curveLinear);

    const sfdLine = d3.line<SFDPoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScaleSFD(d.V))
      .curve(d3.curveLinear);

    const sfdG = svg.append("g");

    // Labels
    sfdG.append("text")
      .attr("x", MARGIN.left + 4).attr("y", MARGIN.top - 4)
      .attr("font-size", 9).attr("fill", "#6366f1").attr("font-weight", "bold")
      .text("SHEAR FORCE DIAGRAM (kN)");

    // Grid
    sfdG.append("line")
      .attr("x1", MARGIN.left).attr("x2", width - MARGIN.right)
      .attr("y1", yScaleSFD(0)).attr("y2", yScaleSFD(0))
      .attr("stroke", "#CBD5E1").attr("stroke-width", 1).attr("stroke-dasharray", "4,2");

    sfdG.append("path").datum(sfd)
      .attr("d", sfdArea)
      .attr("fill", "rgba(99,102,241,0.15)");

    sfdG.append("path").datum(sfd)
      .attr("d", sfdLine)
      .attr("fill", "none")
      .attr("stroke", "#6366f1").attr("stroke-width", 2);

    // Y axis SFD
    const yAxisSFD = d3.axisLeft(yScaleSFD).ticks(4).tickSize(-4);
    sfdG.append("g").attr("transform", `translate(${MARGIN.left},0)`)
      .call(yAxisSFD)
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("text").attr("font-size", 9).attr("fill", "#94a3b8"));

    // Max/min labels
    const maxV = d3.max(sfd, (d) => d.V) ?? 0;
    const minV = d3.min(sfd, (d) => d.V) ?? 0;
    const maxVPt = sfd.find((d) => d.V === maxV);
    const minVPt = sfd.find((d) => d.V === minV);

    if (maxVPt) {
      sfdG.append("text")
        .attr("x", xScale(maxVPt.x) + 4).attr("y", yScaleSFD(maxV) - 4)
        .attr("font-size", 8).attr("fill", "#6366f1").attr("font-weight", "bold")
        .text(`+${maxV.toFixed(1)} kN`);
    }
    if (minVPt && Math.abs(minV) > 0.01) {
      sfdG.append("text")
        .attr("x", xScale(minVPt.x) + 4).attr("y", yScaleSFD(minV) + 10)
        .attr("font-size", 8).attr("fill", "#6366f1").attr("font-weight", "bold")
        .text(`${minV.toFixed(1)} kN`);
    }

    // --- Divider ---
    svg.append("line")
      .attr("x1", MARGIN.left).attr("x2", width - MARGIN.right)
      .attr("y1", halfH + 5).attr("y2", halfH + 5)
      .attr("stroke", "#E2E8F0").attr("stroke-width", 1);

    // --- BMD (bottom half) ---
    const bmdExtent = d3.extent(bmd, (d) => d.M) as [number, number];
    const yScaleBMD = d3.scaleLinear()
      .domain([Math.min(bmdExtent[0], -0.1), Math.max(bmdExtent[1], 0.1)])
      .nice()
      .range([height - MARGIN.bottom, halfH + 10 + MARGIN.top]);

    const bmdArea = d3.area<BMDPoint>()
      .x((d) => xScale(d.x))
      .y0(yScaleBMD(0))
      .y1((d) => yScaleBMD(d.M))
      .curve(d3.curveLinear);

    const bmdLine = d3.line<BMDPoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScaleBMD(d.M))
      .curve(d3.curveLinear);

    const bmdG = svg.append("g");

    bmdG.append("text")
      .attr("x", MARGIN.left + 4).attr("y", halfH + 10 + MARGIN.top - 4)
      .attr("font-size", 9).attr("fill", "#f97316").attr("font-weight", "bold")
      .text("BENDING MOMENT DIAGRAM (kN·m)");

    bmdG.append("line")
      .attr("x1", MARGIN.left).attr("x2", width - MARGIN.right)
      .attr("y1", yScaleBMD(0)).attr("y2", yScaleBMD(0))
      .attr("stroke", "#CBD5E1").attr("stroke-width", 1).attr("stroke-dasharray", "4,2");

    bmdG.append("path").datum(bmd)
      .attr("d", bmdArea)
      .attr("fill", "rgba(249,115,22,0.15)");

    bmdG.append("path").datum(bmd)
      .attr("d", bmdLine)
      .attr("fill", "none")
      .attr("stroke", "#f97316").attr("stroke-width", 2);

    const yAxisBMD = d3.axisLeft(yScaleBMD).ticks(4).tickSize(-4);
    bmdG.append("g").attr("transform", `translate(${MARGIN.left},0)`)
      .call(yAxisBMD)
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("text").attr("font-size", 9).attr("fill", "#94a3b8"));

    // X axis (shared)
    const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat((d) => `${d}m`);
    svg.append("g").attr("transform", `translate(0,${height - MARGIN.bottom})`)
      .call(xAxis)
      .call((g) => g.select(".domain").attr("stroke", "#CBD5E1"))
      .call((g) => g.selectAll("text").attr("font-size", 9).attr("fill", "#94a3b8"));

    // Max BM label
    const maxM = d3.max(bmd, (d) => d.M) ?? 0;
    const maxMPt = bmd.find((d) => d.M === maxM);
    if (maxMPt) {
      bmdG.append("text")
        .attr("x", xScale(maxMPt.x) + 4).attr("y", yScaleBMD(maxM) - 4)
        .attr("font-size", 8).attr("fill", "#f97316").attr("font-weight", "bold")
        .text(`${maxM.toFixed(1)} kN·m`);
    }

  }, [sfd, bmd, size, totalLength]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px]">
      <svg ref={svgRef} width={size.width} height={size.height} />
    </div>
  );
}
