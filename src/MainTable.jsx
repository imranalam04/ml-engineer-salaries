import React, { useState, useEffect } from 'react';
import data from './data.json';
import { useTable, useSortBy } from 'react-table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const MainTable = () => {
  const [selectedYear, setSelectedYear] = useState(null);

  const processData = () => {
    return data.map(yearData => {
      const totalJobs = yearData.jobs.length;
      const averageSalary = (yearData.jobs.reduce((acc, job) => acc + job.salary, 0) / totalJobs).toFixed(2);
      return {
        year: yearData.year,
        totalJobs,
        averageSalary
      };
    });
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Year',
        accessor: 'year'
      },
      {
        Header: 'Number of Total Jobs',
        accessor: 'totalJobs'
      },
      {
        Header: 'Average Salary in USD',
        accessor: 'averageSalary'
      }
    ],
    []
  );

  const dataForTable = React.useMemo(() => processData(), []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data: dataForTable }, useSortBy);

  const lineData = dataForTable.map(item => ({
    year: item.year,
    totalJobs: item.totalJobs
  }));

  const renderRowSubComponent = (row) => {
    const yearData = data.find(d => d.year === row.values.year);
    const jobCounts = yearData.jobs.reduce((acc, job) => {
      acc[job.title] = (acc[job.title] || 0) + 1;
      return acc;
    }, {});

    return (
      <table>
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Number of Jobs</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(jobCounts).map(([title, count]) => (
            <tr key={title}>
              <td>{title}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <React.Fragment key={row.id}>
                <tr {...row.getRowProps()} onClick={() => setSelectedYear(row)}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
                {row === selectedYear ? (
                  <tr>
                    <td colSpan={3}>{renderRowSubComponent(row)}</td>
                  </tr>
                ) : null}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <LineChart width={600} height={300} data={lineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="totalJobs" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </div>
  );
};

export default MainTable;
