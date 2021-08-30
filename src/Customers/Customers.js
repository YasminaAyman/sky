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
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import EditCustomer from './EditCustomer';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';

const columns = [
  {
    key: '1',
    id: 'code',
    label: 'Code',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '2',
    id: 'name',
    label: 'Name',
    minWidth: 170,
    align: 'center',
  },
  {
    key: '3',
    id: 'addr1',
    label: 'Address',
    minWidth: 170,
    align: 'center',
  },
  {
    key: '4',
    id: 'addr2',
    label: 'Region',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '5',
    label: 'City',
    id: 'addr3',
    minWidth: 70,
    align: 'center',
  },
  {
    key: '6',
    id: 'contact',
    label: 'Contact Person',
    minWidth: 100,
    align: 'center',
  },
  {
    key: '7',
    id: 'number',
    label: 'Phone',
    minWidth: 100,
    align: 'center',
  },
  {
    key: '8',
    id: 'taxable',
    label: 'Taxable',
    minWidth: 30,
    align: 'center',
    format: (value) => getTaxable(value),
  },
];

const getTaxable = (val) => {
  if (val) return 'YES'
  else return 'NO'
}

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

export default function Customers() {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState([])
  const [tableCustomers, setTableCustomers] = useState([])
  const [fetchingData, setFetchingData] = useState(true)
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selectedRow, setSelectedRow] = React.useState({});
  const [search, setSearch] = React.useState('');


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

  const fetchCustomers = () => {
    const customersList = []
    return db.collection('customers').orderBy("code")
      .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          customersList.push({ ...doc.data(), id: doc.id });
        });
        return customersList;
      });
  }

  useEffect(() => {
    fetchCustomers().then((res) => {
      setCustomers(res);
      setTableCustomers(res);
      setFetchingData(false)
    });

  }, [fetchingData])


  const useStyles = makeStyles({
    table: {
      minWidth: 700,
    },
    root: {
      width: '100%',
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

  const deleteCustomers = (id) => {
    db.collection("customers").doc(id).delete().then(() => {
      console.log("Document successfully deleted!");
      alert('Customer is deleted successfully!');
      updateTable();

    }).catch((error) => {
      console.error("Error removing document: ", error);
    });
  }

  const filterCustomers = (event) => {
    setSearch(event.target.value)
    const result = customers.filter(customer => customer.code.includes(event.target.value) || customer.name.includes(event.target.value));
    setTableCustomers(result)
  }


  return (
    <Paper className={classes.root}>
      <div style={{ 'padding': '10px' }} >
        <TextField
          id="standard-name"
          label="Search Code/Name"
          value={search}
          onChange={filterCustomers}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>
      <TableContainer className={classes.container}>
        <Table className={classes.table} stickyHeader aria-label="sticky table">
          <EnhancedTableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={tableCustomers.length}
          />
          <TableBody>
            {stableSort(tableCustomers, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                return (
                  <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <StyledTableCell key={column.key} align={column.align}>
                          {column.id === 'taxable' ? column.format(value) : value}
                        </StyledTableCell>
                      );
                    })}
                    <StyledTableCell >
                      <IconButton onClick={() => handleClickOpen(row)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">Customer {selectedRow.code}</DialogTitle>
                        <DialogContent>
                          <EditCustomer rowCustomer={selectedRow} closeDialog={handleClose} updateTable={updateTable} />
                        </DialogContent>
                        <DialogActions>
                        </DialogActions>

                      </Dialog>
                    </StyledTableCell>
                    <StyledTableCell>
                      <IconButton onClick={() => { if (window.confirm(`Are you sure you want to delete Customer with code ` + row.code + `?`)) deleteCustomers(row.id) }}>
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
        count={customers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}