<div className="flex flex-wrap justify-center gap-4 mt-4 px-4">
  {payload?.map((entry: any, index: number) => (
    <div key={`legend-${index}`} className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded-sm flex-shrink-0"
        style={{ backgroundColor: entry.color }}
      />
      <span className="text-sm text-foreground whitespace-nowrap">{entry.value}</span>
    </div>
  ))}
</div>
  )
}

export const ChartPreview = forwardRef<HTMLDivElement, ChartPreviewProps>(
  function ChartPreview({ data, chartType, styles }, ref) {
    const { colorPalette, showGrid, showLegend } = styles
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const { numericColumns, labelColumn } = useMemo(() => {
      const firstRow = data.data[0]
      if (!firstRow) return { numericColumns: [], labelColumn: data.columns[0] || "" }

      const numeric = data.columns.filter((col) => typeof firstRow[col] === "number")
      const label = data.columns.find((col) => typeof firstRow[col] === "string") || data.columns[0] || ""

      return { numericColumns: numeric, labelColumn: label }
    }, [data])

    const tooltipStyle = {
      backgroundColor: isDark ? "#292224" : "#ffffff",
      border: isDark ? "1px solid #333" : "1px solid #e5e5e5",
      borderRadius: "8px",
      color: isDark ? "#fff" : "#000",
      boxShadow: isDark ? "none" : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    }

    if (!data.data.length || !data.columns.length) {
      return (
        <Card ref={ref} className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>{data.title || "Chart"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          </CardContent>
        </Card>
      )
    }

    const renderBarChart = () => (
      <BarChart data={data.data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#e5e5e5"} />}
        <XAxis dataKey={labelColumn} stroke="#888" fontSize={12} />
        <YAxis stroke="#888" fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)" }} />
        {showLegend && <Legend content={CustomLegend} />}
        {numericColumns.map((col, i) => (
          <Bar key={col} dataKey={col} fill={colorPalette[i % colorPalette.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    )

    const renderLineChart = () => (
      <LineChart data={data.data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#e5e5e5"} />}
        <XAxis dataKey={labelColumn} stroke="#888" fontSize={12} />
        <YAxis stroke="#888" fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} />
        {showLegend && <Legend content={CustomLegend} />}
        {numericColumns.map((col, i) => (
          <Line
            key={col}
            type="monotone"
            dataKey={col}
            stroke={colorPalette[i % colorPalette.length]}
            strokeWidth={2}
            dot={{ fill: colorPalette[i % colorPalette.length] }}
          />
        ))}
      </LineChart>
    )

    const renderAreaChart = () => (
      <AreaChart data={data.data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#e5e5e5"} />}
        <XAxis dataKey={labelColumn} stroke="#888" fontSize={12} />
        <YAxis stroke="#888" fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} />
        {showLegend && <Legend content={CustomLegend} />}
        {numericColumns.map((col, i) => (
          <Area
            key={col}
            type="monotone"
            dataKey={col}
            stroke={colorPalette[i % colorPalette.length]}
            fill={colorPalette[i % colorPalette.length]}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    )

    const renderPieChart = () => {
      const pieData = data.data.map((row, i) => ({
        name: String(row[labelColumn] || ""),
        value: Number(row[numericColumns[0]] || 0),
        fill: colorPalette[i % colorPalette.length],
      }))

      return (
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            labelLine={{ stroke: "#888" }}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: isDark ? "#fff" : "#000" }} />
          {showLegend && <Legend content={CustomLegend} />}
        </PieChart>
      )
    }

    const renderDonutChart = () => {
      const donutData = data.data.map((row, i) => ({
        name: String(row[labelColumn] || ""),
        value: Number(row[numericColumns[0]] || 0),
        fill: colorPalette[i % colorPalette.length],
      }))

      return (
        <PieChart>
          <Pie
            data={donutData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            labelLine={{ stroke: "#888" }}
          >
            {donutData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: isDark ? "#fff" : "#000" }} />
          {showLegend && <Legend content={CustomLegend} />}
        </PieChart>
      )
    }

    // Custom Bubble Shape with text inside
    const CustomBubbleShape = (props: any) => {
      const { cx, cy, payload, fill } = props
      const radius = props.r || 30
      const label = String(payload[labelColumn] || "")
      const value = payload[numericColumns[0]] || payload[numericColumns[1]] || ""

      return (
        <g>
          <circle cx={cx} cy={cy} r={radius} fill={fill} opacity={0.8} />
          <text
            x={cx}
            y={cy - 5}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fontWeight="600"
          >
            {label}
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            fill="#fff"
            fontSize={14}
            fontWeight="700"
          >
            {value}
          </text>
        </g>
      )
    }

    const CustomBubbleTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        // Filter out duplicate entries based on name and value
        const uniqueItems = payload.reduce((acc: any[], item: any) => {
          const exists = acc.find((i: any) => i.name === item.name && i.value === item.value)
          if (!exists) {
            acc.push(item)
          }
          return acc
        }, [])

        return (
          <div style={{ ...tooltipStyle, padding: "8px 12px" }}>
            {uniqueItems.map((entry: any, index: number) => (
              <div key={index} className="flex gap-2 text-sm">
                <span style={{ color: isDark ? "#fff" : "#000", fontWeight: 500 }}>{entry.name} :</span>
                <span style={{ color: isDark ? "#ccc" : "#666" }}>{entry.value}</span>
              </div>
            ))}
          </div>
        )
      }
      return null
    }

    const renderBubbleChart = () => {
      // For bubble chart, we need at least 2 numeric columns (x, y) and optionally a third for size
      const xColumn = numericColumns[0] || labelColumn
      const yColumn = numericColumns[1] || numericColumns[0]
      const sizeColumn = numericColumns[2] || numericColumns[0]

      return (
        <ScatterChart margin={{ top: 40, right: 40, bottom: 20, left: 20 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#e5e5e5"} />}
          <XAxis dataKey={xColumn} stroke="#888" fontSize={12} name={xColumn} />
          <YAxis dataKey={yColumn} stroke="#888" fontSize={12} name={yColumn} />
          <ZAxis dataKey={sizeColumn} range={[1000, 4000]} name={sizeColumn} />
          <Tooltip content={<CustomBubbleTooltip />} cursor={{ strokeDasharray: "3 3" }} />
          {showLegend && <Legend content={CustomLegend} />}
          <Scatter
            name={data.title}
            data={data.data}
            fill={colorPalette[0]}
            shape={<CustomBubbleShape />}
          />
        </ScatterChart>
      )
    }

    const renderRadarChart = () => (
      <RadarChart outerRadius={120} data={data.data}>
        <PolarGrid stroke={isDark ? "#333" : "#e5e5e5"} />
        <PolarAngleAxis dataKey={labelColumn} tick={{ fill: "#888", fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: "#888", fontSize: 10 }} />
        {numericColumns.map((col, i) => (
          <Radar
            key={col}
            name={col}
            dataKey={col}
            stroke={colorPalette[i % colorPalette.length]}
            fill={colorPalette[i % colorPalette.length]}
            fillOpacity={0.6}
          />
        ))}
        {showLegend && <Legend content={CustomLegend} />}
        <Tooltip contentStyle={tooltipStyle} />
      </RadarChart>
    )

    const renderTreemapChart = () => {
      const treemapData = data.data.map((row) => ({
        name: String(row[labelColumn] || ""),
        size: Number(row[numericColumns[0]] || 0)
      })).filter(d => d.size > 0)

      // Custom content to show colorful rectangles with text
      const CustomizeTreemapContent = (props: any) => {
        const { root, depth, x, y, width, height, index, name } = props;
        return (
          <g>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill={colorPalette[index % colorPalette.length]}
              stroke="#fff"
            />
            {
              width > 50 && height > 20 && (
                <text
                  x={x + width / 2}
                  y={y + height / 2 + 7}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={12}
                >
                  {name}
                </text>
              )
            }
          </g>
        );
      };

      return (
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizeTreemapContent />}
          >
            <Tooltip contentStyle={tooltipStyle} />
          </Treemap>
        </ResponsiveContainer>
      )
    }

    const renderHeatmapChart = () => {
      // Simple simulation of heatmap using ScatterChart with formatted data
      // We need X and Y keys. If data is pivoted (Month, Region1, Region2...), we need to unpivot visually or treat it as points
      // For standard "heatmap", we ideally want 3 cols: X, Y, Value.
      // Let's assume the user provided pivoted data (Month, Region...) and we map it.
      // Actually, let's just implement a placeholder for Heatmap using standard Scatter for now as a fallback
      // to avoid complex data transformation logic errors here.
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Heatmap requires specific X/Y/Value format. Use Bubble chart for now.
        </div>
      )
    }


    const chartComponents: Record<ChartType, () => React.ReactElement> = {
      bar: renderBarChart,
      line: renderLineChart,
      area: renderAreaChart,
      pie: renderPieChart,
      donut: renderDonutChart,
      bubble: renderBubbleChart,
      radar: renderRadarChart,
      treemap: renderTreemapChart,
      heatmap: renderHeatmapChart, // Placeholder
    }

    return (
      <Card ref={ref} className="w-full max-w-3xl dark:bg-[#150E10]">
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartComponents[chartType]()}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }
)
