import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import * as moment from 'moment';
import Button from '@material-ui/core/Button';
import { PDFExport } from "@progress/kendo-react-pdf";
import logo from './sky.jpg';

const useStyles = makeStyles((theme) => ({
  head: {
    'font-weight': '600'
  },
  root: {
    paddingLeft: '20px',
    paddingRight: '20px',
    fontSize: '12px',
    marginTop: '1.5cm',
    marginBottom: '1.5cm'
  },
  table: {
    //fontSize: '200pt'
  },
  textArea: {
    margin: '5px'
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  }
}));

const getDate = (val) => {
  var date = new Date(val * 1000);
  return moment(date).format('DD/MM/YYYY').toString();
}

const getIsDoc = (val) => {
  if (val) return 'YES'
  else return 'NO'
}
export default function Invoice(props) {

  const pdfExportComponent = React.useRef(null);

  const classes = useStyles();
  const invoice = props.rowInvoice;

  const StyledTableCell = withStyles((theme) => ({
    head: {
      backgroundColor: '#3f51b5',
      color: theme.palette.common.white,
      padding: 0,
      fontWeight: '600',
      fontSize: '8px'
    },
    body: {
      padding: 0,
      fontSize: '8px'
    },
  }))(TableCell);

  const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }))(TableRow);

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
          <Grid container spacing={1} className={classes.root}>
            <Grid item xs={12} sm={12}>
              <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="spanning table">
                  <TableHead>
                    <div style={{ 'width': '450px', 'display': 'flex', 'padding-bottom': '10px' }}>
                      <Grid item xs={12} sm={4} >
                        <Grid item xs={12} sm={12} >
                          <h4>Account Code  {invoice.customer.code}</h4>
                        </Grid>
                        <Grid item xs={12} sm={12} >
                          <div style={{ 'border': 'solid', 'width': '150px', 'border-width': 'thin' }}>
                            <h5 className={classes.textArea} >{invoice.customer.name}</h5>
                            <h5 className={classes.textArea} >{invoice.customer.addr1}</h5>
                            <h5 className={classes.textArea} >{invoice.customer.addr2}</h5>
                            <h5 className={classes.textArea} >{invoice.customer.number}</h5>

                          </div>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sm={4} >
                        <Grid item xs={12} sm={12} style={{ 'padding-left': '10%', 'width': '200px', 'height': '50px' }}>
                          <img style={{ 'width': '150px', 'height': '30px' }} src={logo} alt="Logo" />
                        </Grid>
                        <Grid item xs={12} sm={12} style={{ 'padding-left': '35%' }}>
                          <h2 style={{ 'border': 'solid', 'background-color': 'grey', 'width': '100px', 'textAlign': 'center' }} >INVOICE</h2>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sm={4} style={{ 'padding-left': '10%' }}>
                        <Grid item xs={12} sm={12}>
                          <h4>Invoice Number  {invoice.invoiceNumber}</h4>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                          <h4>Date  {getDate(invoice.date.seconds)}</h4>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                          <h4 style={{ 'border': 'solid', 'border-bottom': 'none', 'width': '200px', 'margin': '0px' }}>Reg. S.T.:276-951-638</h4>
                          <h4 style={{ 'border': 'solid', 'width': '200px', 'margin': '0px' }}>Tax File No:5-359-555-0-13</h4>
                        </Grid>
                      </Grid>
                    </div>
                    <StyledTableRow hover role="checkbox" tabIndex={-1}>
                      <StyledTableCell align="center" >AWB</StyledTableCell>
                      <StyledTableCell align="center" >Date</StyledTableCell>
                      <StyledTableCell align="center" >Origin</StyledTableCell>
                      <StyledTableCell align="center" >Destination</StyledTableCell>
                      <StyledTableCell align="center" >Weight&nbsp;(kg)</StyledTableCell>
                      <StyledTableCell align="center" >Document</StyledTableCell>
                      <StyledTableCell align="center" >Amount&nbsp;($)</StyledTableCell>
                      <StyledTableCell align="center" >Amount&nbsp;(EGP)</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.shippings.map((row) => (
                      <React.Fragment>
                        <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id} style={{ 'border-top': 'solid' }}>
                          <StyledTableCell style={{ 'width': '10%' }} align="center">{row.skyAWB}</StyledTableCell>
                          <StyledTableCell style={{ 'width': '20%' }} align="center">{getDate(row.createDate.seconds)}</StyledTableCell>
                          <StyledTableCell style={{ 'width': '10%' }} align="center">{row.source}</StyledTableCell>
                          <StyledTableCell style={{ 'width': '10%' }} align="center">{row.destination}</StyledTableCell>
                          <StyledTableCell style={{ 'width': '10%' }} align="center">{row.weight}</StyledTableCell>
                          <StyledTableCell style={{ 'width': '10%' }} align="center">{getIsDoc(row.isDoc)}</StyledTableCell>
                          <StyledTableCell style={{ 'width': '10%' }} align="center">{row.amountDollar}</StyledTableCell>
                          <StyledTableCell style={{ 'width': '20%' }} align="center">{row.amount}</StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow hover role="checkbox" tabIndex={-1}>
                          <StyledTableCell align="right" style={{ 'font-weight': '600' }} colSpan={6}>Fuel Surcharge</StyledTableCell>
                          <StyledTableCell align="center">{row.fcAmountDollar}</StyledTableCell>
                          <StyledTableCell align="center">{row.fcAmount}</StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow hover role="checkbox" tabIndex={-1}>
                          <StyledTableCell align="right" style={{ 'font-weight': '600' }} colSpan={6}>Extra Fees</StyledTableCell>
                          <StyledTableCell align="center">{row.extraFeesDollar}</StyledTableCell>
                          <StyledTableCell align="center">{row.extraFees}</StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow hover role="checkbox" tabIndex={-1}>
                          <StyledTableCell align="right" style={{ 'font-weight': '600' }} colSpan={6}>Agency Fees</StyledTableCell>
                          <StyledTableCell align="center">{row.pfDollar}</StyledTableCell>
                          <StyledTableCell align="center">{row.pf}</StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow hover role="checkbox" tabIndex={-1}>
                          <StyledTableCell align="right" style={{ 'font-weight': '600' }} colSpan={6}>Total </StyledTableCell>
                          <StyledTableCell align="center" style={{ 'font-weight': '600' }}>{row.amountTotalDollar}</StyledTableCell>
                          <StyledTableCell align="center" style={{ 'font-weight': '600' }}>{row.amountTotal}</StyledTableCell>
                        </StyledTableRow>
                      </React.Fragment>
                    ))}

                    <TableRow style={{ 'border-top': 'solid' }}>
                      <StyledTableCell style={{ 'font-weight': '600' }} align="right">Total Weight</StyledTableCell>
                      <StyledTableCell style={{ 'font-weight': '600' }} align="center">{Number(invoice.totalWeight).toFixed(2)}</StyledTableCell>
                      <StyledTableCell style={{ 'font-weight': '600' }} align="right" colSpan={5} >Total Amount</StyledTableCell>
                      <StyledTableCell align="center" style={{ 'font-weight': '600' }}>{Number(invoice.total).toFixed(2)}</StyledTableCell>
                    </TableRow>
                    {invoice.totalVAT !== 0 ?
                      <TableRow>
                        <StyledTableCell style={{ 'font-weight': '600' }} align="right" colSpan={7} >VAT (14%)</StyledTableCell>
                        <StyledTableCell style={{ 'font-weight': '600' }} align="center">{Number(invoice.totalVAT).toFixed(2)}</StyledTableCell>
                      </TableRow>
                      : <div />}
                    <TableRow style={{ 'border-top': 'solid' }}>
                      <StyledTableCell align="right" colSpan={7} style={{ 'font-weight': '700', 'padding-right': '15%' }}>Grand Total</StyledTableCell>
                      <StyledTableCell align="center" style={{ 'font-weight': '700' }}>{Number(Number(invoice.total) + Number(invoice.totalVAT)).toFixed(2)}</StyledTableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} sm={12} style={{ 'display': 'flex' }}>
              <h4 style={{ 'border': 'dotted', 'text-align': 'start' }}>Exchange Rate  {invoice.rate}</h4>

              <div style={{ 'border': 'solid', 'margin-left': '100px' }}>
                <h4 style={{ 'margin': '0px', 'text-align': 'center' }}>Important Notice</h4>
                <h4 style={{ 'margin': '0px', 'text-align': 'center' }}>Time limit of 7 days applied to any invoice issues.</h4>
                <h4 style={{ 'margin': '0px', 'text-align': 'center' }}>Queries received after the 15th day will not be accepted.</h4>
              </div>
            </Grid>

          </Grid>
        </PDFExport>
      </div>
    </React.Fragment >

  )
}
