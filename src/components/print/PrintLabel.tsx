import { useEffect } from 'react';
import { Document, Page, View, Text, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import type { PrintableLabel, ProdHeader } from '../../services/api';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

// Type alias for compatibility
export type LabelDataItem = PrintableLabel;

// Constants for label dimensions (100mm x 60mm = 283.46pt x 170.08pt)
const LABEL_WIDTH = 288;
const LABEL_HEIGHT = 161;
const COL_WIDTH = LABEL_WIDTH / 12; // ~23.62pt per column
const ROW_HEIGHT = LABEL_HEIGHT / 11; // ~15.46pt per row


const styles = StyleSheet.create({
  page: {
    padding: 6,
    backgroundColor: '#FFFFFF',
  },
  labelContainer: {
    width: LABEL_WIDTH,
    height: LABEL_HEIGHT,
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'solid',
    marginBottom: 2,
    marginRight: 2,
  },
  // Row styles
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  lastRow: {
    flexDirection: 'row',
  },
  // Cell styles
  cell: {
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 1,
    fontSize: 6,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellAlt: {
    borderRightWidth: 1,
    borderRightColor: '#000000',
    padding: 1,
    fontSize: 6,
    textAlign: 'left',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  lastCell: {
    padding: 1,
    fontSize: 6,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastCellAlt: {
    padding: 1,
    fontSize: 6,
    textAlign: 'left',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  boldText: {
    fontFamily: 'Helvetica-Bold',
  },
});

interface LabelDocumentProps {
  data?: LabelDataItem[];
  prodHeader?: Partial<ProdHeader>;
}

const SingleLabel = ({ item, prodHeader, qrCode1, qrCode2 }: { 
  item: LabelDataItem; 
  prodHeader?: Partial<ProdHeader>;
  qrCode1?: string;
  qrCode2?: string;
}) => {
  return (
    <View style={styles.labelContainer} wrap={false}>
      {/* ROW 1-2: Company Logo + Header */}
      <View style={[styles.row, { height: ROW_HEIGHT * 2 }]}>
        {/* Cell A: Company Logo (Col 1-4, Row 1-2) */}
        <View style={[styles.cell, { width: COL_WIDTH * 4, justifyContent: 'center', alignItems: 'center' }]}>
          <Image src="/images/logo/Sanoh-Mono-06.png" style={{ width: 55, height: 20 }} />
        </View>
        
        {/* Right section: Supplier No, Job No, Back No, ID TMMIN (Col 5-12, Row 1-2) */}
        <View style={{ width: COL_WIDTH * 8, flexDirection: 'column' }}>
          {/* Row 1: Header */}
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000000', height: ROW_HEIGHT }}>
            <View style={[styles.cell, { width: COL_WIDTH * 2, borderBottomWidth: 0 }]}>
              <Text style={styles.boldText}>Supplier No.</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH * 2, borderBottomWidth: 0 }]}>
              <Text style={styles.boldText}>Job No.</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH * 2, borderBottomWidth: 0, borderRightWidth: 0 }]}>
              <Text style={styles.boldText}>Back No.</Text>
            </View>
            <View style={[styles.lastCell, { width: COL_WIDTH * 2, borderBottomWidth: 0, borderLeftWidth: 1 }]}>
              <Text style={styles.boldText}>ID TMMIN</Text>
            </View>
          </View>
          
          {/* Row 2: Values */}
          <View style={{ flexDirection: 'row', height: ROW_HEIGHT }}>
            <View style={[styles.cell, { width: COL_WIDTH * 2, justifyContent: 'center' }]}>
              <Text style={{ fontSize: 8 }}>3000474</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH * 2, justifyContent: 'center' }]}>
              <Text style={{ fontSize: 8 }}>{item.unique_no || ' - '}</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH * 2, justifyContent: 'center', borderRightWidth: 0 }]}>
              <Text style={{ fontSize: 8 }}>{item.back_no || '-'}</Text>
            </View>
            <View style={[styles.lastCell, { width: COL_WIDTH * 2, justifyContent: 'center', borderLeftWidth: 1 }]}>
              <Text style={{ fontSize: 8 }}>{item.tmmin_id || '-'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ROW 3: Part No + QR Headers */}
      <View style={[styles.row, { height: ROW_HEIGHT }]}>
        <View style={[styles.cellAlt, { width: COL_WIDTH * 2 }]}>
          <Text style={styles.boldText}>Part No</Text>
        </View>
        <View style={[styles.cellAlt, { width: COL_WIDTH * 5, borderRightWidth: 0 }]}>
          <Text style={[styles.boldText, {fontSize: 8}]}>{item.part_no || ''}</Text>
        </View>
        <View style={[styles.cellAlt, { width: COL_WIDTH}]}>
          <Text style={{ fontSize: 7, textAlign: 'left' }}></Text>
        </View>
        <View style={[styles.cell, { width: COL_WIDTH * 2, borderRightWidth: 0 }]}>
          <Text style={[styles.boldText, { fontSize: 5 }]}>QR CODE 1</Text>
        </View>
        <View style={[styles.lastCell, { width: COL_WIDTH * 2, borderLeftWidth: 1 }]}>
          <Text style={[styles.boldText, { fontSize: 5 }]}>QR CODE 2</Text>
        </View>
      </View>

      {/* ROW 4-11: Combined container to properly handle all merged cells */}
      <View style={{ flexDirection: 'row', height: ROW_HEIGHT * 8 }}>
        {/* Left section: Col 1-8 (Row 4-11) */}
        <View style={{ width: COL_WIDTH * 8, flexDirection: 'column' }}>
          {/* ROW 4: Part Name */}
          <View style={[styles.row, { height: ROW_HEIGHT }]}>
            <View style={[styles.cellAlt, { width: COL_WIDTH * 2, borderBottomWidth: 0 }]}>
              <Text style={styles.boldText}>Part Name</Text>
            </View>
            <View style={[styles.cellAlt, { width: COL_WIDTH * 5, borderBottomWidth: 0, borderRightWidth: 0 }]}>
              <Text style={[styles.boldText, {fontSize: 8}]}>{item.description || ''}</Text>
            </View>
            <View style={[styles.cellAlt, { width: COL_WIDTH, borderBottomWidth: 0, borderRightWidth: 1 }]}>
              <Text style={{ fontSize: 7, textAlign: 'left' }}></Text>
            </View>
          </View>

          {/* ROW 5: Lot No */}
          <View style={[styles.row, { height: ROW_HEIGHT }]}>
            <View style={[styles.cellAlt, { width: COL_WIDTH * 2, borderBottomWidth: 0 }]}>
              <Text style={styles.boldText}>Lot No</Text>
            </View>
            <View style={[styles.cellAlt, { width: COL_WIDTH * 5, borderBottomWidth: 0, borderRightWidth: 0 }]}>
              <Text style={[styles.boldText, {fontSize: 8}]}>{item.lot_no || ''} </Text>
            </View>
            <View style={[styles.cellAlt, { width: COL_WIDTH, borderBottomWidth: 0, borderRightWidth: 1 }]}>
              <Text style={{ fontSize: 7, textAlign: 'left' }}></Text>
            </View>
          </View>

          {/* ROW 6: Operator Name */}
          <View style={[styles.row, { height: ROW_HEIGHT }]}>
            <View style={[styles.cellAlt, { width: COL_WIDTH * 2, borderBottomWidth: 0 }]}>
              <Text style={styles.boldText}>Operator Name</Text>
            </View>
            <View style={[styles.cellAlt, { width: COL_WIDTH, borderBottomWidth: 0, borderRightWidth: 0 }]}>
              <Text style={styles.boldText}></Text>
            </View>
            <View style={[styles.cellAlt, { width: COL_WIDTH * 3, borderBottomWidth: 0 }]}>
              <Text style={{ fontSize: 7, textAlign: 'left' }}></Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH * 2, borderBottomWidth: 0, borderRightWidth: 1 }]}>
              <Text style={{ fontSize: 6 }}>{item.model || ''}</Text>
            </View>
          </View>

          {/* ROW 7-8: Date/Shift - merged cells */}
          <View style={[styles.lastRow, { height: ROW_HEIGHT * 2 }]}>
            <View style={[styles.cellAlt, { width: COL_WIDTH * 2, borderRightWidth: 1, height: ROW_HEIGHT * 2 }]}>
              <Text style={styles.boldText}>Date / Shift</Text>
            </View>
            <View style={[styles.cellAlt, { width: COL_WIDTH, borderRightWidth: 0, height: ROW_HEIGHT * 2 }]}>
              <Text style={styles.boldText}></Text>
            </View>
            <View style={[styles.cellAlt, { width: COL_WIDTH * 3, borderRightWidth: 1, height: ROW_HEIGHT * 2 }]}>
              <Text style={{ textAlign: 'left', fontSize: 7 }}>{item.date || ''}</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH, borderRightWidth: 1, height: ROW_HEIGHT * 2 }]}>
              <Text style={{ fontSize: 6 }}>D</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH, borderRightWidth: 1, height: ROW_HEIGHT * 2 }]}>
              <Text style={{ fontSize: 6 }}>N</Text>
            </View>
          </View>

          {/* ROW 9: Status Headers */}
          <View style={[styles.row, { height: ROW_HEIGHT }]}>            
            <View style={[styles.cell, { width: COL_WIDTH * 2, borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: '#000000' }]}>
              <Text style={styles.boldText}>Status</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH * 2, borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: '#000000' }]}>
              <Text style={[styles.boldText, { fontSize: 5 }]}>Qty [PCS]</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH * 2, borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: '#000000' }]}>
              <Text style={styles.boldText}>Quality</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH * 2, borderBottomWidth: 0, borderRightWidth: 1, borderTopWidth: 1, borderTopColor: '#000000' }]}>
              <Text style={[styles.boldText, { fontSize: 5 }]}>PIC Delivery</Text>
            </View>
          </View>

          {/* ROW 10-11: Status Values (2 rows combined) */}
          <View style={[styles.lastRow, { height: ROW_HEIGHT * 2 }]}>
            <View style={[styles.cell, { width: COL_WIDTH * 2, borderRightWidth: 1, borderBottomWidth: 0, justifyContent: 'center' }]}>
              <Text style={{ fontSize: 8 }}>FG</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH * 2, borderRightWidth: 1, borderBottomWidth: 0, justifyContent: 'center' }]}>
              <Text style={{ fontSize: 8 }}>{item.qty || 0}</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH * 2, borderRightWidth: 1, borderBottomWidth: 0, justifyContent: 'center' }]}>
              <Text style={{ fontSize: 7 }}>OK / NG</Text>
            </View>
            <View style={[styles.cell, { width: COL_WIDTH * 2, borderRightWidth: 1, borderBottomWidth: 0, justifyContent: 'center' }]}>
              <Text></Text>
            </View>
          </View>
        </View>

        {/* Col 9-10: QR CODE 1 (Row 4-7) + Prod_no (Row 8) + Characteristics (Row 9-11) */}
        <View style={{ width: COL_WIDTH * 2, flexDirection: 'column' }}>
          {/* ROW 4-7: QR CODE 1 - MERGED */}
          <View style={[styles.cell, { 
            width: COL_WIDTH * 2,
            height: ROW_HEIGHT * 4,
            borderRightWidth: 1,
            borderBottomWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 2
          }]}>
            {qrCode1 && (
              <Image src={qrCode1} style={{ width: COL_WIDTH * 1.2, height: ROW_HEIGHT * 2.1 }} />
            )}
          </View>

          {/* ROW 8: Prod_no */}
          <View style={[styles.cell, { 
            width: COL_WIDTH * 2,
            height: ROW_HEIGHT,
            borderRightWidth: 1,
            borderBottomWidth: 0,
            justifyContent: 'center',
            alignItems: 'center'
          }]}>
            <Text style={{ fontSize: 6, textAlign: 'center' }}>{prodHeader?.prod_no || ''}</Text>
          </View>

          {/* ROW 9: Characteristics header */}
          <View style={[styles.cell, { 
            height: ROW_HEIGHT,
            borderBottomWidth: 1,
            borderRightWidth: 0,
            borderTopWidth: 1,
            borderTopColor: '#000000',
            justifyContent: 'center',
            alignItems: 'center'
          }]}>
            <Text style={[styles.boldText, { fontSize: 5 }]}>Characteristics</Text>
          </View>

          {/* ROW 10-11: Characteristics value */}
          <View style={[styles.cell, { 
            height: ROW_HEIGHT * 2,
            borderRightWidth: 0,
            borderBottomWidth: 0,
            justifyContent:'center',
            alignItems: 'center'
          }]}>
            <Text style={{ fontSize: 6 }}>{item.karakteristik || ''}</Text>
          </View>
        </View>

        {/* Col 11-12: print_data text (Row 4-5) + QR CODE 2 (Row 6-8 partial) */}
        <View style={{ width: COL_WIDTH * 2, flexDirection: 'column' }}>
          {/* ROW 4-5: print_data text */}
          <View style={[styles.lastCell, { 
            width: COL_WIDTH * 2,
            height: ROW_HEIGHT * 2,
            borderBottomWidth: 1,
            borderLeftWidth: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: 2,
            paddingTop: 3
          }]}>
            <Text style={{ 
              fontSize: 5, 
              textAlign: 'left',
              maxWidth: COL_WIDTH * 1.9
            }}>
              {(() => {
                const text = item.print_data || '';
                if (text.length <= 12) return text;
                
                const line1 = text.substring(0, 12);
                const remaining1 = text.substring(12);
                
                if (remaining1.length <= 12) {
                  return `${line1}\n${remaining1}`;
                }
                
                const line2 = remaining1.substring(0, 12);
                const remaining2 = remaining1.substring(12);
                
                if (remaining2.length <= 12) {
                  return `${line1}\n${line2}\n${remaining2}`;
                }
                
                const line3 = remaining2.substring(0, 12);
                const line4 = remaining2.substring(12, 24);
                return `${line1}\n${line2}\n${line3}\n${line4}`;
              })()}
            </Text>
          </View>

          {/* ROW 6-11: QR CODE 2 - MERGED (spanning 6 rows) */}
          <View style={[styles.lastCell, { 
            width: COL_WIDTH * 2,
            height: ROW_HEIGHT * 6,
            borderBottomWidth: 0,
            borderLeftWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2
          }]}>
            {qrCode2 && (
              <Image src={qrCode2} style={{ width: COL_WIDTH * 1.8, height: ROW_HEIGHT * 2.8 }} />
            )}
          </View>
        </View>
      </View>


    </View>
  );
};

// Helper function to generate QR code as data URL
const generateQRCodeDataURL = async (text: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
};

// Helper interface for label with QR codes
interface LabelWithQRCodes extends LabelDataItem {
  qrCode1?: string;
  qrCode2?: string;
}

const LabelDocument = ({ data, prodHeader }: LabelDocumentProps) => {
  const labels = data || [];
  const labelsPerPage = 10; // 2 columns x 5 rows per page
  
  // Split labels into pages
  const pages: LabelDataItem[][] = [];
  for (let i = 0; i < labels.length; i += labelsPerPage) {
    pages.push(labels.slice(i, i + labelsPerPage));
  }

  if (pages.length === 0) {
    pages.push([]);
  }
  
  return (
    <Document>
      {pages.map((pageLabels, pageIndex) => {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const formattedTime = currentDate.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        
        return (
          <Page key={pageIndex} size="A4" orientation="portrait" style={styles.page}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {pageLabels.map((item, index) => (
                <SingleLabel 
                  key={item.label_id || index} 
                  item={item} 
                  prodHeader={prodHeader}
                  // QR codes will be passed here after generation
                />
              ))}
            </View>
            
            {/* Page Footer */}
            <View style={{ 
              position: 'absolute', 
              bottom: 10, 
              left: 10, 
              right: 10, 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              fontSize: 8,
            }}>
              <Text>Printed at {formattedDate} {formattedTime}</Text>
              <Text>{pageIndex + 1}/{pages.length}</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

// Component that generates QR codes and creates a PDF document
interface LabelDocumentWithQRProps extends LabelDocumentProps {
  labelsWithQR: LabelWithQRCodes[];
}

const LabelDocumentWithQR = ({ labelsWithQR, prodHeader }: LabelDocumentWithQRProps) => {
  const labelsPerPage = 10; // 2 columns x 5 rows per page
  
  // Split labels into pages
  const pages: LabelWithQRCodes[][] = [];
  for (let i = 0; i < labelsWithQR.length; i += labelsPerPage) {
    pages.push(labelsWithQR.slice(i, i + labelsPerPage));
  }

  if (pages.length === 0) {
    pages.push([]);
  }
  
  return (
    <Document>
      {pages.map((pageLabels, pageIndex) => {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const formattedTime = currentDate.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        
        return (
          <Page key={pageIndex} size="A4" orientation="portrait" style={styles.page}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {pageLabels.map((item, index) => (
                <SingleLabel 
                  key={item.label_id || index} 
                  item={item} 
                  prodHeader={prodHeader}
                  qrCode1={item.qrCode1}
                  qrCode2={item.qrCode2}
                />
              ))}
            </View>
            
            {/* Page Footer */}
            <View style={{ 
              position: 'absolute', 
              bottom: 10, 
              left: 10, 
              right: 10, 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              fontSize: 8,
            }}>
              <Text>Printed at {formattedDate} {formattedTime}</Text>
              <Text>{pageIndex + 1}/{pages.length}</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default LabelDocument;

// Utility function to generate and open PDF in new tab
export const openPDFInNewTab = async (data?: LabelDataItem[], prodHeader?: Partial<ProdHeader>) => {
  // Show loading toast
  const loadingToast = toast.loading('Generating QR codes and PDF...');
  
  try {
    // Generate QR codes for all labels
    const labelsWithQR: LabelWithQRCodes[] = [];
    
    // Generate QR CODE 1 from prod_no (same for all labels)
    const qrCode1 = prodHeader?.prod_no 
      ? await generateQRCodeDataURL(prodHeader.prod_no)
      : '';
    
    // Generate QR CODE 2 for each label from print_data
    if (data && data.length > 0) {
      for (const item of data) {
        const qrCode2 = item.print_data 
          ? await generateQRCodeDataURL(item.print_data)
          : '';
        
        labelsWithQR.push({
          ...item,
          qrCode1,
          qrCode2,
        });
      }
    }
    
    // Generate PDF blob
    const blob = await pdf(<LabelDocumentWithQR labelsWithQR={labelsWithQR} prodHeader={prodHeader} />).toBlob();
    const url = URL.createObjectURL(blob);

    // Open PDF directly in new tab
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      toast.error('Failed to open PDF. Please allow pop-ups and try again.', {
        id: loadingToast,
      });
      return;
    }
    
    // Show success toast
    toast.success('PDF opened in new tab!', {
      id: loadingToast,
    });
    
    // Clean up URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    toast.error('Failed to generate PDF. Please try again.', {
      id: loadingToast,
    });
  }
};

// Wrapper component to handle PDF rendering and opening in new tab
export const PrintLabel = ({ data, prodHeader }: LabelDocumentProps) => {
  useEffect(() => {
    openPDFInNewTab(data, prodHeader);
  }, [data, prodHeader]);

  return null;
};
