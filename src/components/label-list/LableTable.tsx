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


export default function DataTableThree() {
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableRowData, setTableRowData] = useState<ProdHeader[]>([]);
  const [filteredData, setFilteredData] = useState<ProdHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prodNoFilter, setProdNoFilter] = useState<string>("");

  // Fetch data from API (fetch all data once)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await labelAPI.getProdHeaders();
        
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

  // Filter data when search term changes
  useEffect(() => {
    if (prodNoFilter.trim() === "") {
      setFilteredData(tableRowData);
    } else {
      const filtered = tableRowData.filter(item =>
        item.prod_no.toLowerCase().includes(prodNoFilter.toLowerCase())
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1); // Reset to first page when filtering
  }, [prodNoFilter, tableRowData]);

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

  // Rows per page handler
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProdNoFilter(e.target.value);
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <button className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400">
              <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                  fill=""
                />
              </svg>
            </button>

            <input
              type="text"
              value={prodNoFilter}
              onChange={handleSearchInputChange}
              placeholder="Search by Prod No..."
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            />
          </div>
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
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Prod Index</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Prod No</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Part No</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Part Name</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Customer</p>
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Qty Order</p>
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
