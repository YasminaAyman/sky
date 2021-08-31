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
import EditShipping from './EditShipping';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import PropTypes from 'prop-types';
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { Button } from '@material-ui/core';
import { PDFExport } from "@progress/kendo-react-pdf";


const columns = [
  {
    key: '1',
    id: 'createDate',
    label: 'Create Date',
    width: '10%',
    format: (value) => getDate(value),
    align: 'center',
  },
  {
    key: '2',
    id: 'skyAWB',
    label: 'Sky AWB',
    width: '6%',
    align: 'center',
  },
  {
    key: '3',
    id: 'AWB',
    label: 'AWB',
    width: '6%',
    align: 'center',
  },
  {
    key: '11',
    id: 'customerCode',
    label: 'Customer Code',
    width: '6%',
    align: 'center',
  },
  {
    key: '10',
    id: 'customerName',
    label: 'Customer Name',
    width: '12%',
    align: 'center',
  },
  {
    key: '9',
    id: 'destination',
    label: 'Country',
    width: '9%',
    align: 'center',
  },
  {
    key: '8',
    id: 'zone',
    label: 'Zone',
    width: '3%',
    align: 'center',
  },
  {
    key: '4',
    id: 'weight',
    label: 'Weight',
    width: '7%',
    align: 'center',
  },
  {
    key: '5',
    id: 'cost',
    label: 'Cost (LE)',
    width: '8%',
    align: 'center',
  },
  {
    key: '6',
    id: 'dollarCost',
    label: 'Cost ($)',
    width: '8%',
    align: 'center',
  },
  {
    key: '12',
    id: 'extraFees',
    label: 'Extra Fees ($)',
    width: '5%',
    align: 'center',
  },
  {
    key: '13',
    id: 'status',
    label: 'Status',
    width: '7%',
    align: 'center',
  },
  {
    key: '14',
    id: 'statusChangeDate',
    label: 'Status Date',
    width: '9%',
    align: 'center',
    format: (value) => getDate(value),
  },
  {
    key: '7',
    id: 'isDoc',
    label: 'Document',
    width: '3%',
    align: 'center',
    format: (value) => getIsDoc(value),
  },
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

const getDate = (val) => {
  var date = new Date(val * 1000);
  return moment(date).format('DD/MM/YYYY').toString();
}

const getIsDoc = (val) => {
  if (val) return 'YES'
  else return 'NO'
}

const ExportStyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: '#3f51b5',
    color: theme.palette.common.white,
    padding: 0,
    fontWeight: '400',
    fontSize: '6px'
  },
  body: {
    padding: 0,
    fontSize: '6px'
  },
}))(TableCell);

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
            style={{ width: column.width }}
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

export default function TableShippings() {

  const pdfExportComponent = React.useRef(null);
  const [open, setOpen] = useState(false);
  const [shippings, setShippings] = useState([])
  const [fetchingData, setFetchingData] = useState(true)
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selectedRow, setSelectedRow] = React.useState({});
  const [fromDate, setFromDate] = React.useState(new Date('2020-01-01T00:00:00'));
  const [toDate, setToDate] = React.useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);

  const handleFromDate = (date) => {
    setFromDate(date);
  };

  const handleToDate = (date) => {
    setToDate(date);
  }


  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };


  const handleClickOpen = (row) => {
    setOpen(true);
    setSelectedRow(row);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const updateTable = () => {
    setFetchingData(true);
  }

  const filterShippings = () => {
    setFetchingData(true);
  }

  const fetchShippings = () => {
    const shippingList = []
    return db.collection('shippings')
      .where("createDate", ">=", new Date(fromDate.setHours(0, 0, 0, 0)))
      .where("createDate", "<=", new Date(toDate.setHours(23, 59, 59, 999)))
      .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          shippingList.push({ ...doc.data(), id: doc.id });
        });
        return shippingList;
      });
  }

  useEffect(() => {
    fetchShippings().then((res) => {
      setShippings(res);
      setFetchingData(false)
    });

  }, [fetchingData])


  const useStyles = makeStyles({
    table: {
      minWidth: '100%',
    },
    exportTable: {
      fontSize: '200pt'
    },
    root: {
      width: '100%',
      maxWidth: '100%',
    },
    exportRoot: {
      marginTop: '2cm',
      marginBottom: '1.5cm',
      padding: '10px'
    },
    container: {
      maxHeight: '100%',
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
  });

  const classes = useStyles();


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const deleteShipping = (id) => {
    db.collection("shippings").doc(id).delete().then(() => {
      console.log("Document successfully deleted!");
      alert('Shipping is deleted successfully!');
      updateTable();

    }).catch((error) => {
      console.error("Error removing document: ", error);
    });
  }

  const getStatus = (value) => {
    switch (value) {
      case 1:
        return 'Picked Up'
      case 2:
        return 'Arrived at Cairo'
      case 3:
        return 'Departed Facility in Cairo'
      case 4:
        return 'Arrived at Final Destination'
      case 5:
        return 'Delivered'
      case 6:
        return 'Need Correct Address'
      default:
        return ''
    }

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
              {stableSort(shippings, getComparator(order, orderBy))
                .map((row) => (
                  <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <ExportStyledTableCell key={column.key} align={column.align}>
                          {column.id === 'createDate' || column.id === 'statusChangeDate' ? column.format(value.seconds) : (column.id === 'isDoc' ? column.format(value) : (column.id === 'status' ? getStatus(value) : value))}
                        </ExportStyledTableCell>
                      );
                    })}
                  </StyledTableRow>
                )
                )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    )
  }

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Paper className={classes.root}>
      <Grid container spacing={3} style={{ 'padding-left': '15px' }}>
        <Grid container item xs={12} sm={9}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid container justifyContent="space-around">
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="dd/MM/yyyy"
                margin="normal"
                id="date-picker-inline"
                label="From Date"
                value={fromDate}
                onChange={handleFromDate}
                KeyboardButtonProps={{
                  'aria-label': 'from date',
                }}
              />
              <KeyboardDatePicker
                style={{ 'margin-left': '20px' }}
                disableToolbar
                variant="inline"
                format="dd/MM/yyyy"
                margin="normal"
                id="date-picker-inline"
                label="To Date"
                value={toDate}
                onChange={handleToDate}
                KeyboardButtonProps={{
                  'aria-label': 'to date',
                }}
              />
            </Grid>
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid container item xs={12} sm={3}>
          <Button style={{ 'height': '40px', 'align-self': 'center', 'margin-right': '15px' }} variant="contained" color="primary" onClick={filterShippings}>
            Filter
          </Button>
          <Button style={{ 'height': '40px', 'align-self': 'center' }}
            variant="contained"
            color="primary"
            onClick={() => setOpenDialog(true)}>
            Preview
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
        </Grid>
      </Grid>
      <TableContainer className={classes.container}>
        <Table className={classes.table} stickyHeader aria-label="sticky table">
          <EnhancedTableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={shippings.length}
          />
          <TableBody>
            {stableSort(shippings, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                return (
                  <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <StyledTableCell style={{ 'padding': '0' }} key={column.key} align={column.align}>
                          {column.id === 'createDate' || column.id === 'statusChangeDate' ? column.format(value.seconds) : (column.id === 'isDoc' ? column.format(value) : (column.id === 'status' ? getStatus(value) : value))}
                        </StyledTableCell>
                      );
                    })}
                    <StyledTableCell style={{ width: '50px' }} >
                      <IconButton onClick={() => handleClickOpen(row)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">Shipping {selectedRow.skyAWB}</DialogTitle>
                        <DialogContent>
                          <EditShipping rowShipping={selectedRow} closeDialog={handleClose} updateTable={updateTable} />
                        </DialogContent>
                        <DialogActions>
                        </DialogActions>

                      </Dialog>
                    </StyledTableCell>
                    <StyledTableCell style={{ width: '50px' }}>
                      <IconButton onClick={() => { if (window.confirm(`Are you sure you want to delete shipping with skyAWB ` + row.skyAWB + `?`)) deleteShipping(row.id) }}>
                        <DeleteIcon color="primary" />
                      </IconButton>
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
        count={shippings.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
