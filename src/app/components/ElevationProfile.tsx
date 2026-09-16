import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ElevationProfileProps {
  data: { distance: number; elevation: number }[];
  color?: string;
}

function feetToMeters(feet: number) {
  return feet * 0.3048;
}

export function ElevationProfile({
  data,
  color = "#10b981",
}: ElevationProfileProps) {
  const metricData = data.map((point) => ({
    ...point,
    elevation: feetToMeters(point.elevation),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-3 shadow-lg">
          <p className="mb-1 text-sm text-white">
            <span className="text-neutral-400">
              Distance:
            </span>{" "}
            {payload[0].payload.distance.toFixed(1)} km
          </p>

          <p className="text-sm text-white">
            <span className="text-neutral-400">
              Elevation:
            </span>{" "}
            {payload[0].payload.elevation.toFixed(0)} m
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={metricData}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient
            id="elevationGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor={color}
              stopOpacity={0.8}
            />

            <stop
              offset="95%"
              stopColor={color}
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#404040"
          opacity={0.3}
        />

        <XAxis
          dataKey="distance"
          stroke="#737373"
          tick={{
            fill: "#a3a3a3",
            fontSize: 11,
          }}
          tickFormatter={(value) =>
            `${Number(value).toFixed(1)} km`
          }
        />

        <YAxis
          stroke="#737373"
          tick={{
            fill: "#a3a3a3",
            fontSize: 11,
          }}
          tickFormatter={(value) =>
            `${Number(value).toFixed(0)} m`
          }
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone"
          dataKey="elevation"
          stroke={color}
          strokeWidth={2}
          fill="url(#elevationGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}