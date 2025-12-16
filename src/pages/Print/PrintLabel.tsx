import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { PrintLabel as PrintLabelComponent, LabelDataItem } from '../../components/print/PrintLabel';
import type { ProdHeader } from '../../services/api';

const PrintLabel = () => {
  const location = useLocation();
  const [labelData, setLabelData] = useState<LabelDataItem[]>([]);
  const [prodHeader, setProdHeader] = useState<ProdHeader | undefined>(undefined);

  useEffect(() => {
    // Get data from navigation state
    const stateData = location.state as { labelData?: LabelDataItem[], prodHeader?: ProdHeader } | null;
    
    if (stateData?.labelData && stateData.labelData.length > 0) {
      setLabelData(stateData.labelData);
      setProdHeader(stateData.prodHeader);
    }
  }, [location.state]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {labelData.length > 0 ? (
        <PrintLabelComponent data={labelData} prodHeader={prodHeader} />
      ) : (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-lg font-medium text-gray-700">
            Loading Data...
          </p>
        </div>
      )}
    </div>
  );
};

export default PrintLabel;


