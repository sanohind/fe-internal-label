import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { Printer, ArrowLeft } from 'lucide-react';
import { labelAPI, PrintableLabel, PrintableLabelsResponse } from "../../services/api";
import { openPDFInNewTab } from "../../components/print/PrintLabel";

export default function LabelDetail() {
  const { prodNo } = useParams<{ prodNo: string }>();
  const navigate = useNavigate();
  const [selectedLabels, setSelectedLabels] = useState<Set<number>>(new Set());
  const [labelData, setLabelData] = useState<PrintableLabel[]>([]);
  const [filteredLabelData, setFilteredLabelData] = useState<PrintableLabel[]>([]);
  const [lotNoFilter, setLotNoFilter] = useState<string>("");
  const [prodHeader, setProdHeader] = useState<PrintableLabelsResponse['prod_header'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch label details from API
  useEffect(() => {
    const fetchLabelDetails = async () => {
      if (!prodNo) {
        setError('Prod No is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await labelAPI.getPrintableLabels(prodNo);
        
        if (response.success) {
          setLabelData(response.data);
          setProdHeader(response.prod_header);
        } else {
          setError(response.message || 'Failed to fetch label details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching label details');
        console.error('Error fetching label details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLabelDetails();
  }, [prodNo]);

  // Filter label data based on Lot No search
  useEffect(() => {
    if (lotNoFilter.trim() === "") {
      setFilteredLabelData(labelData);
    } else {
      const filtered = labelData.filter(item => 
        item.lot_no.toLowerCase().includes(lotNoFilter.toLowerCase())
      );
      setFilteredLabelData(filtered);
    }
  }, [lotNoFilter, labelData]);

  const handleLabelSelect = (labelId: number) => {
    const newSelectedLabels = new Set(selectedLabels);
    if (newSelectedLabels.has(labelId)) {
      newSelectedLabels.delete(labelId);
    } else {
      newSelectedLabels.add(labelId);
    }
    setSelectedLabels(newSelectedLabels);
  };

  const handleSelectAll = () => {
    if (selectedLabels.size === filteredLabelData.length && filteredLabelData.length > 0) {
      setSelectedLabels(new Set());
    } else {
      setSelectedLabels(new Set(filteredLabelData.map(item => item.label_id)));
    }
  };

  const handlePrint = () => {
    if (selectedLabels.size === 0) {
      alert('Please select at least one label to print');
      return;
    }

    // Get only selected labels
    const selectedData = labelData.filter(item => selectedLabels.has(item.label_id));

    // Directly open PDF in new tab
    openPDFInNewTab(selectedData, prodHeader as any);
  };

  const handleBackToList = () => {
    navigate('/label-list');
  };

  const handleLotNoSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLotNoFilter(e.target.value);
  };

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      {/* Header with back button */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to List</span>
        </button>
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Label Details
        </h2>
        {prodHeader && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Prod No: <span className="font-medium">{prodHeader.prod_no}</span> | 
            Prod Index: <span className="font-medium">{prodHeader.prod_index}</span>
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03]">
        <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Available Labels ({filteredLabelData.length}{lotNoFilter && ` of ${labelData.length}`})
            </h3>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search by Lot No */}
            <div className="relative">
              <button className="absolute text-gray-500 -translate-y-1/2 left-3 top-1/2 dark:text-gray-400">
                <svg className="fill-current" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                value={lotNoFilter}
                onChange={handleLotNoSearch}
                placeholder="Search by Lot No..."
                className="dark:bg-dark-900 h-9 w-full rounded-lg border border-gray-300 bg-transparent py-2 pl-9 pr-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 sm:w-[200px]"
              />
            </div>

            {/* Selected count and print button */}
            <div className="flex items-center gap-3">
              {selectedLabels.size > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedLabels.size} selected
                </span>
              )}
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handlePrint} 
                disabled={loading || selectedLabels.size === 0}
              >
                <Printer size='16px' />
                Print Selected
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-500 dark:text-gray-400">Loading label details...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-red-500">Error: {error}</div>
            </div>
          ) : filteredLabelData.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-500 dark:text-gray-400">
                {lotNoFilter ? `No labels found matching "${lotNoFilter}"` : 'No labels found for this Prod No'}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={selectedLabels.size === filteredLabelData.length && filteredLabelData.length > 0} 
                        onChange={handleSelectAll} 
                      />
                      <span className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Lot No</span>
                    </div>
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
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Qty</p>
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLabelData.map((item) => (
                  <TableRow key={item.label_id}>
                    <TableCell className="px-4 py-4 border border-gray-100 dark:border-white/[0.05] dark:text-white/90 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedLabels.has(item.label_id)} 
                          onChange={() => handleLabelSelect(item.label_id)} 
                        />
                        <span className="font-normal text-gray-800 text-theme-sm dark:text-white/90">{item.lot_no}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                      {prodHeader?.prod_no}
                    </TableCell>
                    <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                      {item.part_no}
                    </TableCell>
                    <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                      {item.description}
                    </TableCell>
                    <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap">
                      {item.qty}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
