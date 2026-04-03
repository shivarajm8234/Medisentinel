import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NetworkTrafficChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Generate initial flat data
    const initial = Array.from({ length: 30 }, (_, i) => ({
      time: i,
      inbound: 10 + Math.random() * 5,
      outbound: 8 + Math.random() * 4,
    }));
    setData(initial);

    // Simulate live Kafka traffic
    const interval = setInterval(() => {
      setData((current) => {
        const newData = [...current.slice(1)];
        const last = current[current.length - 1];
        
        // Occasional spike to simulate anomaly
        const spike = Math.random() > 0.95 ? 40 : 0;
        
        newData.push({
          time: last.time + 1,
          inbound: 10 + Math.random() * 5 + spike,
          outbound: 8 + Math.random() * 4 + (spike*0.8),
        });
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel">
      <div className="panel-header">
        Real-Time Ingestion (MQTT <span style={{margin:'0 4px'}}>→</span> Kafka Topic: raw_data)
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis hide domain={[0, 'dataMax + 10']} />
            <Tooltip 
              contentStyle={{ background: 'rgba(10,10,15,0.9)', border: '1px solid var(--color-primary)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="inbound" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorInbound)" isAnimationActive={false} />
            <Area type="monotone" dataKey="outbound" stroke="var(--color-secondary)" strokeWidth={2} fillOpacity={1} fill="url(#colorOutbound)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NetworkTrafficChart;
