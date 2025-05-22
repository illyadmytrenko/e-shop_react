"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  week: number;
  totalMoneyAmount: number;
};

const currentYear = new Date().getFullYear();
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function MoneyAmountStatsChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const weeks = Array.from({ length: 5 }, (_, i) => i + 1);
      const results: ChartData[] = [];

      for (const week of weeks) {
        try {
          const res = await fetch(
            `http://localhost:5000/orders/stats/amount?year=${year}&month=${month}&week=${week}`
          );

          if (!res.ok) throw new Error("Ошибка запроса");

          const json = await res.json();

          results.push({
            week,
            totalMoneyAmount: json.totalAmount || 0,
          });
        } catch (err) {
          console.error(`Ошибка при получении данных за неделю ${week}:`, err);
          results.push({ week, totalMoneyAmount: 0 });
        }
      }

      setData(results);
      setLoading(false);
    };

    fetchStats();
  }, [year, month]);

  return (
    <div className="w-full h-[400px] mb-20">
      <h2 className="text-xl font-semibold mb-4">
        Money amount statistics spent by week
      </h2>
      <div className="flex items-center gap-4 mb-4">
        <label>
          <span>Year: </span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border p-1 rounded"
          >
            {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Month: </span>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border p-1 rounded"
          >
            {months.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <p>Loaging...</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              label={{ value: "Week", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              allowDecimals={false}
              label={{
                value: "Money Amount",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length) {
                  const { week, totalMoneyAmount } = payload[0].payload;
                  return (
                    <div className="bg-white px-2 py-3 font-medium text-lg">
                      <p>{`${week} week`}</p>
                      <p>{`$${totalMoneyAmount} spent total`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="totalMoneyAmount"
              fill="#82ca9d"
              name="Total Spent"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
