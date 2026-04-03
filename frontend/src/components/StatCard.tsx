import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  isCritical?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, isCritical }) => {
  return (
    <motion.div 
      className={`glass-panel stat-card ${isCritical ? 'critical' : ''}`}
      whileHover={{ y: -5 }}
    >
      <div className="stat-title">
        {icon}
        {title}
      </div>
      <div className="stat-value" style={{ color: isCritical ? 'var(--color-accent)' : 'var(--text-main)' }}>
        {value}
      </div>
      {trend && (
        <div className={`stat-trend ${trend.startsWith('+') ? 'trend-up' : 'trend-down'}`}>
           {trend} from last hour
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
