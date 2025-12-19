import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Pagination from "./Pagination";
import { labelAPI, ProdHeader } from "../../services/api";

// Helper function to convert color code aliases to full names
const getColorName = (colorCode: string): string => {
  const colorMap: { [key: string]: string } = {
    'WHT': 'WHITE',
    'BLU': 'BLUE',
    'GRN': 'GREEN',
    'RED': 'RED',
    'YEL': 'YELLOW',
  };
  return colorMap[colorCode.toUpperCase()] || colorCode;
};


export default function DataTableThree() {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableRowData, setTableRowData] = useState<ProdHeader[]>([]);
  const [filteredData, setFilteredData] = useState<ProdHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState({
    prodIndex: "",
    prodNo: "",
    partNo: "",
    partName: "",
    customer: "",
    qtyOrder: "",
    colorCode: "",
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await labelAPI.getProdHeaders(undefined);

        if (response.success) {
          setTableRowData(response.data);
          setFilteredData(response.data);
        } else {
          setError(response.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
        console.error('Error fetching prod headers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data when any column filter changes
  useEffect(() => {
    let filtered = [...tableRowData];

    // Apply prod index filter
    if (columnFilters.prodIndex.trim() !== "") {
      filtered = filtered.filter(item =>
        item.prod_index.toLowerCase().includes(columnFilters.prodIndex.toLowerCase())
      );
    }

    // Apply prod no filter
    if (columnFilters.prodNo.trim() !== "") {
      filtered = filtered.filter(item =>
        item.prod_no.toLowerCase().includes(columnFilters.prodNo.toLowerCase())
      );
    }

    // Apply part no filter
    if (columnFilters.partNo.trim() !== "") {
      filtered = filtered.filter(item =>
        item.item.toLowerCase().includes(columnFilters.partNo.toLowerCase())
      );
    }

    // Apply part name filter
    if (columnFilters.partName.trim() !== "") {
      filtered = filtered.filter(item =>
        (item.mat_desc || item.description || "").toLowerCase().includes(columnFilters.partName.toLowerCase())
      );
    }

    // Apply customer filter
    if (columnFilters.customer.trim() !== "") {
      filtered = filtered.filter(item =>
        item.customer.toLowerCase().includes(columnFilters.customer.toLowerCase())
      );
    }

    // Apply qty order filter
    if (columnFilters.qtyOrder.trim() !== "") {
      filtered = filtered.filter(item =>
        item.qty_order.toString().includes(columnFilters.qtyOrder)
      );
    }

    // Apply color code filter
    if (columnFilters.colorCode.trim() !== "") {
      filtered = filtered.filter(item => {
        const colorCode = item.color_code || "";
        const colorName = getColorName(colorCode);
        const searchTerm = columnFilters.colorCode.toLowerCase();
        return colorCode.toLowerCase().includes(searchTerm) || 
               colorName.toLowerCase().includes(searchTerm);
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [columnFilters, tableRowData]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const currentData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Calculate total pages and current data slice
  const totalEntries = filteredData.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const handleColumnFilterChange = (column: keyof typeof columnFilters, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // Navigate to label detail page
  const handleProdNoClick = (prodNo: string) => {
    navigate(`/label-detail/${prodNo}`);
  };


  return (
    <div className="overflow-hidden  rounded-xl  bg-white  dark:bg-white/[0.03]">
      <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400"> Show </span>
          <div className="relative z-20 bg-transparent">
            <select
              className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              <option value="10" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                10
              </option>
              <option value="20" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                20
              </option>
              <option value="30" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                30
              </option>
              <option value="50" className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                50
              </option>
            </select>
            <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
              <svg className="stroke-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165" stroke="" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <span className="text-gray-500 dark:text-gray-400"> entries </span>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500 dark:text-gray-400">Loading data...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-500">Error: {error}</div>
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400 mb-2">Prod Index</p>
                    <input
                      type="text"
                      value={columnFilters.prodIndex}
                      onChange={(e) => handleColumnFilterChange('prodIndex', e.target.value)}
                      placeholder="Filter..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                    />
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400 mb-2">Prod No</p>
                    <input
                      type="text"
                      value={columnFilters.prodNo}
                      onChange={(e) => handleColumnFilterChange('prodNo', e.target.value)}
                      placeholder="Filter..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                    />
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400 mb-2">Part No</p>
                    <input
                      type="text"
                      value={columnFilters.partNo}
                      onChange={(e) => handleColumnFilterChange('partNo', e.target.value)}
                      placeholder="Filter..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                    />
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400 mb-2">Part Name</p>
                    <input
                      type="text"
                      value={columnFilters.partName}
                      onChange={(e) => handleColumnFilterChange('partName', e.target.value)}
                      placeholder="Filter..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                    />
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400 mb-2">Customer</p>
                    <input
                      type="text"
                      value={columnFilters.customer}
                      onChange={(e) => handleColumnFilterChange('customer', e.target.value)}
                      placeholder="Filter..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                    />
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400 mb-2">Qty Order</p>
                    <input
                      type="text"
                      value={columnFilters.qtyOrder}
                      onChange={(e) => handleColumnFilterChange('qtyOrder', e.target.value)}
                      placeholder="Filter..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                    />
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400 mb-2">Color Code</p>
                    <div className="relative">
                      <select
                        value={columnFilters.colorCode}
                        onChange={(e) => handleColumnFilterChange('colorCode', e.target.value)}
                        className="w-full py-1 pl-2 pr-10 text-xs text-gray-800 bg-transparent border border-gray-300 rounded appearance-none focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                      >
                        <option value="" className="dark:bg-gray-900">All</option>
                        <option value="WHITE" className="dark:bg-gray-900">WHITE</option>
                        <option value="BLUE" className="dark:bg-gray-900">BLUE</option>
                        <option value="GREEN" className="dark:bg-gray-900">GREEN</option>
                        <option value="RED" className="dark:bg-gray-900">RED</option>
                        <option value="YELLOW" className="dark:bg-gray-900">YELLOW</option>
                      </select>
                      <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-1 top-1/2 dark:text-gray-400 pointer-events-none">
                        <svg className="stroke-current" width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165" stroke="" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-4 py-4 border border-gray-100 dark:border-white/[0.05] dark:text-white/90 whitespace-nowrap">
                      <span className="font-normal text-gray-800 text-theme-sm dark:text-white/90">{item.prod_index}</span>
                    </TableCell>
                    <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-gray-400 whitespace-nowrap">
                      <button
                        onClick={() => handleProdNoClick(item.prod_no)}
                        className="text-brand-500 hover:text-brand-600 hover:underline cursor-pointer transition-colors"
                      >
                        {item.prod_no}
                      </button>
                    </TableCell>
                    <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                      {item.item}
                    </TableCell>
                    <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                      {item.mat_desc || item.description}
                    </TableCell>
                    <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                      {item.customer}
                    </TableCell>
                    <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                      {item.qty_order}
                    </TableCell>
                    <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                      {item.color_code ? getColorName(item.color_code) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
          {/* Left side: Showing entries */}
          <div className="pb-3 xl:pb-0">
            <p className="pb-3 text-sm font-medium text-center text-gray-500 border-b border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-b-0 xl:pb-0 xl:text-left">
              Showing {startIndex + 1} to {endIndex} of {totalEntries} entries
            </p>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
}
