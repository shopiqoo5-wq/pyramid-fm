import React from 'react';
import './UI.css';

interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Table = <T extends Record<string, any>>({ 
  columns, 
  data, 
  onRowClick,
  className = '',
  style
}: TableProps<T>) => {
  return (
    <div className={`ui-table-container ${className}`} style={style}>
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="ui-table-empty">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr 
                key={row.id || index} 
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'clickable-row' : ''}
              >
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
