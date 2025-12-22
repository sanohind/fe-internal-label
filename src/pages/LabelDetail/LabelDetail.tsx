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
import SpinnerOne from "../../components/ui/spinner/SpinnerOne";

export default function LabelDetail() {
  const { prodNo } = useParams<{ prodNo: string }>();
  const navigate = useNavigate();
  const [selectedLabels, setSelectedLabels] = useState<Set<number>>(new Set());
  const [labelData, setLabelData] = useState<PrintableLabel[]>([]);
  const [filteredLabelData, setFilteredLabelData] = useState<PrintableLabel[]>([]);
  const [columnFilters, setColumnFilters] = useState(() => {
    const defaultFilters = {
      lotNo: "",
      prodNo: "",
      partNo: "",
      partName: "",
      qty: "",
    };
    
    if (!prodNo) return defaultFilters;

    try {
      const saved = localStorage.getItem("labelDetailFilters");
      if (saved) {
        const { prodNo: savedProdNo, filters } = JSON.parse(saved);
        if (savedProdNo === prodNo) {
          return filters;
        }
      }
    } catch (e) {
      console.error("Failed to parse label detail filters", e);
    }
    return defaultFilters;
  });

  // Save filters to localStorage
  useEffect(() => {
    if (prodNo) {
      localStorage.setItem("labelDetailFilters", JSON.stringify({
        prodNo,
        filters: columnFilters
      }));
    }
  }, [columnFilters, prodNo]);
  const [prodHeader, setProdHeader] = useState<PrintableLabelsResponse['prod_header'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [is404Error, setIs404Error] = useState(false);
  const [isPrintingPDF, setIsPrintingPDF] = useState(false);

  // Fetch label details from API
  const fetchLabelDetails = async () => {
    if (!prodNo) {
      setError('Prod No is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIs404Error(false);
      const response = await labelAPI.getPrintableLabels(prodNo);

      if (response.success) {
        setLabelData(response.data);
        setProdHeader(response.prod_header);
      } else {
        setError(response.message || 'Failed to fetch label details');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching label details';
      
      // Check if it's a 404 error
      if (errorMessage.includes('404') || errorMessage.includes('No printable labels found')) {
        setIs404Error(true);
        setError('No printable labels found for this Prod no');
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching label details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabelDetails();
  }, [prodNo]);

  // Filter label data based on column filters
  useEffect(() => {
    let filtered = [...labelData];
    
    // Apply lot no filter
    if (columnFilters.lotNo.trim() !== "") {
      filtered = filtered.filter(item =>
        item.lot_no.toLowerCase().includes(columnFilters.lotNo.toLowerCase())
      );
    }

    // Apply prod no filter
    if (columnFilters.prodNo.trim() !== "") {
      filtered = filtered.filter(_item =>
        (prodHeader?.prod_no || "").toLowerCase().includes(columnFilters.prodNo.toLowerCase())
      );
    }

    // Apply part no filter
    if (columnFilters.partNo.trim() !== "") {
      filtered = filtered.filter(item =>
        item.part_no.toLowerCase().includes(columnFilters.partNo.toLowerCase())
      );
    }

    // Apply part name filter
    if (columnFilters.partName.trim() !== "") {
      filtered = filtered.filter(item =>
        item.description.toLowerCase().includes(columnFilters.partName.toLowerCase())
      );
    }

    // Apply qty filter
    if (columnFilters.qty.trim() !== "") {
      filtered = filtered.filter(item =>
        item.qty.toString().includes(columnFilters.qty)
      );
    }

    setFilteredLabelData(filtered);
  }, [columnFilters, labelData, prodHeader]);

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

  const handlePrint = async () => {
    if (selectedLabels.size === 0) {
      alert('Please select at least one label to print');
      return;
    }

    // Get only selected labels
    const selectedData = labelData.filter(item => selectedLabels.has(item.label_id));

    // Show loading overlay
    setIsPrintingPDF(true);

    try {
      // Directly open PDF in new tab
      await openPDFInNewTab(selectedData, prodHeader as any);

      // Mark labels as printed
      const selectedLabelIds = Array.from(selectedLabels);
      try {
        await labelAPI.markPrinted(selectedLabelIds);
        console.log('Labels marked as printed:', selectedLabelIds);

        // Clear selected labels
        setSelectedLabels(new Set());

        // Auto-refresh: Fetch updated label data from backend
        await fetchLabelDetails();
      } catch (error) {
        console.error('Error marking labels as printed:', error);
        // Don't stop the flow if this fails, just log the error
      }
    } finally {
      // Hide loading overlay after PDF is generated
      setIsPrintingPDF(false);
    }
  };

  const handleBackToList = () => {
    navigate('/label-list');
  };

  const handleColumnFilterChange = (column: keyof typeof columnFilters, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      {/* PDF Rendering Loading Overlay */}
      {isPrintingPDF && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
          <div className="flex flex-col items-center gap-6">
            <SpinnerOne />
            <p className="text-xl font-regular text-gray-800 dark:text-white">
              Rendering PDF, please wait...
            </p>
          </div>
        </div>
      )}

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
              Available Labels ({filteredLabelData.length}{Object.values(columnFilters).some(v => v !== "") && ` of ${labelData.length}`})
            </h3>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="text-gray-600 dark:text-gray-400 text-lg font-medium">{error}</div>
              {is404Error && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleBackToList}
                >
                  <ArrowLeft size={16} />
                  Back to Prod List
                </Button>
              )}
            </div>
          ) : filteredLabelData.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-500 dark:text-gray-400">
                {Object.values(columnFilters).some(v => v !== "") ? 'No labels found matching the filters' : 'No labels found for this Prod No'}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedLabels.size === filteredLabelData.length && filteredLabelData.length > 0}
                          onChange={handleSelectAll}
                        />
                        <span className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Lot No</span>
                      </div>
                      <input
                        type="text"
                        value={columnFilters.lotNo}
                        onChange={(e) => handleColumnFilterChange('lotNo', e.target.value)}
                        placeholder="Filter..."
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                      />
                    </div>
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
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400 mb-2">Qty</p>
                    <input
                      type="text"
                      value={columnFilters.qty}
                      onChange={(e) => handleColumnFilterChange('qty', e.target.value)}
                      placeholder="Filter..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                    />
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
