import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import { PDFExport } from "@progress/kendo-react-pdf";
import InvoiceDetails from './InvoiceDetails';


export default function Invoice(props) {

  const pdfExportComponent = React.useRef(null);
  const invoice = props.rowInvoice;

  return (
    <React.Fragment>
      <CssBaseline />
      <div className="example-config">
        <Button
          style={{ 'margin-top': '30px', 'margin-left': '85%' }}
          variant="contained"
          color="primary"
          onClick={() => {
            if (pdfExportComponent.current) {
              pdfExportComponent.current.save();
            }
          }}
        >
          Export PDF
        </Button>
      </div>
      <div >
        <PDFExport paperSize="A4" margin={{ bottom: '4.5cm', top: '3.5cm' }} repeatHeaders={true} ref={pdfExportComponent}>
          <InvoiceDetails rowInvoice={invoice} />
        </PDFExport>
      </div>
    </React.Fragment >

  )
}
