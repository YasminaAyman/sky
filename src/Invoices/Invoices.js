import db from '../firebase.config';
import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import * as moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import EditInvoice from './EditInvoice';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Invoice from './Invoice';
import PropTypes from 'prop-types';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';
import { Button } from '@material-ui/core';
import { PDFExport } from "@progress/kendo-react-pdf";
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const columns = [
  {
    key: '1',
    id: 'invoiceNumber',
    label: 'Invoice Number',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '2',
    id: 'date',
    label: 'Date',
    minWidth: 70,
    align: 'center',
  },
  {
    key: 'code',
    label: 'Customer Code',
    id: 'customer',
    minWidth: 50,
    align: 'center',
  },
  {
    key: 'name',
    label: 'Customer Name',
    id: 'customer',
    minWidth: 170,
    align: 'center',
  },
  {
    key: '13',
    id: 'pieces',
    label: 'Pieces',
    minWidth: 20,
    align: 'center',
  },
  {
    key: '5',
    id: 'rate',
    label: 'Rate',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '10',
    id: 'totalExtra',
    label: 'Extra Fees',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '8',
    id: 'totalWeight',
    label: 'Total Weight',
    minWidth: 70,
    align: 'center',
    format: (value) => Number(value).toFixed(2),
  },
  {
    key: '14',
    id: 'totalAmount',
    label: 'Amount',
    minWidth: 70,
    align: 'center',
    format: (value) => Number(value).toFixed(2),
  },
  {
    key: '6',
    id: 'fc',
    label: 'Fuel Charge',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '9',
    id: 'totalFC',
    label: 'Amount FC',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '11',
    id: 'totalPF',
    label: 'Total PF',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '12',
    id: 'totalVAT',
    label: 'Total VAT',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '7',
    label: 'Grand Total',
    id: 'grandTotal',
    minWidth: 90,
    align: 'center',
    format: (value) => Number(value).toFixed(2),
  }
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: '#3f51b5',
    color: theme.palette.common.white,
    padding: 0
  },
  body: {
    fontSize: 14,
    padding: 0
  },
}))(TableCell);

const ExportStyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: '#3f51b5',
    color: theme.palette.common.white,
    padding: 0,
    fontWeight: '400',
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

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <StyledTableRow>
        {columns.map((column) => (
          <StyledTableCell
            key={column.key}
            align={column.align}
            style={{ minWidth: column.minWidth }}
            sortDirection={orderBy === column.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === column.id}
              direction={orderBy === column.id ? order : 'asc'}
              onClick={createSortHandler(column.id)}
            >
              {column.label}
              {orderBy === column.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </StyledTableCell>
        ))}
      </StyledTableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default function Invoices() {
  const pdfExportComponent = React.useRef(null);
  const [open, setOpen] = useState(false);
  const [openFull, setOpenFull] = useState(false);
  const [invoices, setInvoices] = useState([])
  const [fetchingData, setFetchingData] = useState(true)
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selectedRow, setSelectedRow] = React.useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [exportedInvoices, setExportedInvoices] = useState([])
  const [exportedTotal, setExportedTotal] = useState({});
  const [date, setDate] = React.useState(Date.now())


  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };


  const handleClickOpen = (row) => {
    setOpen(true);
    setSelectedRow(row);
  };

  const handleClickOpenFullDial = (row) => {
    setOpenFull(true);
    setSelectedRow(row);
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseFull = () => {
    setOpenFull(false);
  };

  const updateTable = () => {
    setFetchingData(true);
  }

  const handleDateChange = (date) => {
    setDate(date);
    updateTable()
  };

  const fetchInvoices = () => {
    const invoicesList = []
    return db.collection('invoices')
      .where('date', "==", moment(date).format('MM/YYYY'))
      .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          invoicesList.push({ ...doc.data(), id: doc.id });
        });
        return invoicesList;
      });
  }

  useEffect(() => {
    fetchInvoices().then((res) => {
      setInvoices(res);
      setFetchingData(false)
    });

  }, [fetchingData])

  const useStyles = makeStyles((theme) => ({
    table: {
      minWidth: 700,
    },
    root: {
      width: '100%',
    },
    exportRoot: {
      marginTop: '2cm',
      marginBottom: '1.5cm',
      padding: '10px'
    },
    container: {
      maxHeight: '100%',
    },
    exportTable: {
      fontSize: '200pt'
    },
    exportHead: {
      backgroundColor: '#3f51b5',
      color: theme.palette.common.white,
      padding: 0,
      fontWeight: '400',
      fontSize: '6px'
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
    appBar: {
      position: 'relative',
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
  }));

  const classes = useStyles();


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const deleteInvoices = (id) => {
    db.collection("invoices").doc(id).delete().then(() => {
      console.log("Document successfully deleted!");
      alert('Invoice is deleted successfully!');
      updateTable();

    }).catch((error) => {
      console.error("Error removing document: ", error);
    });
  }

  const setCustomExportedInvoices = (type) => {
    const toBeExported = [];

    invoices.forEach((invoice) => {
      var found = false;
      var shippingList = [];
      var totalAmount = 0, totalWeight = 0, totalVAT = 0, totalExtra = 0, totalFC = 0, totalPF = 0, total = 0, grandTotal;
      invoice.shippings.forEach((shipping) => {
        if ((type === 1 && Number(shipping.weight) <= 50) || (type === 2 && Number(shipping.weight) > 50)) {
          found = true;
          shippingList.push(shipping)
          totalAmount += Number(shipping.amount)
          totalExtra += Number(shipping.extraFees)
          totalFC += Number(shipping.fcAmount)
          totalPF += Number(shipping.pf)
          totalVAT += Number(shipping.amountTotal) * (invoice.customer.taxable ? 0.14 : 0)
          totalWeight += Number(shipping.weight)
          total += Number(shipping.amountTotal) * (invoice.customer.taxable ? 1.14 : 1)
        }
      })
      if (found) {
        toBeExported.push({
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
          rate: invoice.rate,
          fc: invoice.fc,
          customer: invoice.customer,
          shippings: shippingList,
          pieces: shippingList.length,
          totalAmount: Number(totalAmount).toFixed(2),
          totalVAT: Number(totalVAT).toFixed(2),
          totalExtra: Number(totalExtra).toFixed(2),
          totalFC: Number(totalFC).toFixed(2),
          totalPF: Number(totalPF).toFixed(2),
          totalWeight: Number(totalWeight),
          grandTotal: Number(total).toFixed(2)
        })
      }
    })
    setExportedInvoices(toBeExported);
    setInvoicesReport(toBeExported);
  }

  const setInvoicesReport = (invoices) => {
    var allPieces = 0, allExtra = 0, allWeight = 0, allAmount = 0, allFC = 0, allPF = 0, allVAT = 0, allTotal = 0;
    invoices.forEach((invoice) => {
      allPieces += invoice.pieces;
      allExtra += Number(invoice.totalExtra);
      allWeight += Number(invoice.totalWeight);
      allAmount += Number(invoice.totalAmount)
      allPF += Number(invoice.totalPF);
      allFC += Number(invoice.totalFC);
      allVAT += Number(invoice.totalVAT);
      allTotal += Number(invoice.grandTotal);
    })
    setExportedTotal({
      allPieces,
      allExtra: allExtra.toFixed(2),
      allWeight: allWeight.toFixed(2),
      allAmount: allAmount.toFixed(2),
      allFC: allFC.toFixed(2),
      allPF: allPF.toFixed(2),
      allVAT: allVAT.toFixed(2),
      allTotal: allTotal.toFixed(2)
    })
  }

  function ExportedTable() {
    return (
      <Grid container spacing={1} className={classes.exportRoot}>
        <TableContainer component={Paper} style={{ 'padding': '15px' }}>
          <Table className={classes.exportTable} aria-label="spanning table">
            <TableHead>
              <StyledTableRow hover role="checkbox" tabIndex={-1}>
                {columns.map((column) => (
                  <ExportStyledTableCell
                    key={column.key}
                    align={column.align}
                  >
                    {column.label}
                  </ExportStyledTableCell>
                ))}
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {stableSort(exportedInvoices, getComparator(order, orderBy))
                .map((row) => (
                  <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <ExportStyledTableCell key={column.key} align={column.align}>
                          {(column.id === 'customer' ? value[column.key] : (column.id === 'totalWeight' || column.id === 'totalAmount' ? column.format(value) : value))}
                        </ExportStyledTableCell>
                      );
                    })}
                  </StyledTableRow>
                )
                )}
              <StyledTableRow style={{ 'border-top': 'solid' }}>
                <ExportStyledTableCell align='right' style={{ 'padding-right': '2%' }} colSpan={5}>{Number(exportedTotal.allPieces)}</ExportStyledTableCell>
                <ExportStyledTableCell align='right' style={{ 'padding-right': '3%' }} colSpan={2}>{Number(exportedTotal.allExtra)}</ExportStyledTableCell>
                <ExportStyledTableCell align='center' colSpan={1}>{Number(exportedTotal.allWeight)}</ExportStyledTableCell>
                <ExportStyledTableCell align='center' colSpan={1}>{Number(exportedTotal.allAmount)}</ExportStyledTableCell>
                <ExportStyledTableCell align='right' style={{ 'padding-right': '2%' }} colSpan={2}>{Number(exportedTotal.allFC)}</ExportStyledTableCell>
                <ExportStyledTableCell align='center' colSpan={1}>{Number(exportedTotal.allPF)}</ExportStyledTableCell>
                <ExportStyledTableCell align='center' colSpan={1}>{Number(exportedTotal.allVAT)}</ExportStyledTableCell>
                <ExportStyledTableCell align='center' colSpan={1}>{Number(exportedTotal.allTotal)}</ExportStyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    )
  }

  return (
    <Paper className={classes.root}>
      <div style={{ 'padding': '20px' }}>
        <Button style={{ 'height': '40px', 'align-self': 'center', 'margin-right': '20px' }}
          variant="contained"
          color="primary"
          onClick={() => {
            setExportedInvoices(invoices)
            setInvoicesReport(invoices)
            setOpenDialog(true)
          }}>
          All Invoices
        </Button>
        <Button style={{ 'height': '40px', 'align-self': 'center', 'margin-right': '20px' }}
          variant="contained"
          color="primary"
          onClick={() => {
            setCustomExportedInvoices(1)
            setOpenDialog(true)
          }}>
          Up To 50 KG
        </Button>
        <Button style={{ 'height': '40px', 'align-self': 'center' }}
          variant="contained"
          color="primary"
          onClick={() => {
            setCustomExportedInvoices(2)
            setOpenDialog(true)
          }}>
          More Than 50 kG
        </Button>
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="form-dialog-title"
          maxWidth="lg"
          fullWidth={true}
        >
          <DialogContent>
            <Button
              style={{ 'margin': '20px', 'margin-left': '85%', 'height': '50px' }}
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
            <PDFExport paperSize="A4" ref={pdfExportComponent} >
              <ExportedTable />
            </PDFExport>
          </DialogContent>
        </Dialog>
        <div style={{ 'text-align': 'right' }}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
              variant="inline"
              openTo="year"
              views={["year", "month"]}
              label="Year and Month"
              helperText="Start from year selection"
              value={date}
              onChange={handleDateChange}
              maxDate={Date.now()}
            />
          </MuiPickersUtilsProvider>
        </div>
      </div>
      <TableContainer className={classes.container}>
        <Table className={classes.table} stickyHeader aria-label="sticky table">
          <EnhancedTableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={invoices.length}
          />
          <TableBody>
            {stableSort(invoices, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                return (
                  <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <StyledTableCell key={column.key} align={column.align}>
                          {(column.id === 'customer' ? value[column.key] : (column.id === 'totalWeight' || column.id === 'totalAmount' ? column.format(value) : value))}
                        </StyledTableCell>
                      );
                    })}
                    <StyledTableCell style={{ 'width': '50px' }} >
                      <IconButton onClick={() => handleClickOpen(row)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">Invoice {selectedRow.id}</DialogTitle>
                        <DialogContent>
                          <EditInvoice rowInvoice={selectedRow} closeDialog={handleClose} updateTable={updateTable} />
                        </DialogContent>
                        <DialogActions>
                        </DialogActions>

                      </Dialog>
                    </StyledTableCell>

                    <StyledTableCell style={{ 'width': '50px' }} >
                      <IconButton onClick={() => { if (window.confirm(`Are you sure you want to delete Invoice with Invoice Number ` + row.invoiceNumber + `?`)) deleteInvoices(row.id) }}>
                        <DeleteIcon color="primary" />
                      </IconButton>
                    </StyledTableCell>

                    <StyledTableCell style={{ 'width': '50px' }} >
                      <IconButton onClick={() => handleClickOpenFullDial(row)}>
                        <OpenInNewIcon color="primary" />
                      </IconButton>
                      <Dialog maxWidth="lg" open={openFull} onClose={handleCloseFull} TransitionComponent={Transition}>
                        <AppBar className={classes.appBar}>
                          <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={handleCloseFull} aria-label="close">
                              <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" className={classes.title}>
                              Invoice
                            </Typography>
                          </Toolbar>
                        </AppBar>
                        <Invoice rowInvoice={selectedRow} closeDialog={handleCloseFull} />
                      </Dialog>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={invoices.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );

}