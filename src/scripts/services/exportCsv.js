import Papa from 'papaparse';

angular.module('financier').factory('exportCsv', () => {
  function create(transactions, months) {
    return _download(_package(
      _buildTransactionsCsv(transactions),
      _buildBudgetCsv(months)
    ));
  }

  function _buildTransactionsCsv(transactions) {
    return Papa.unparse({
      fields: ['Account', 'Flag', 'Date', 'Payee', 'Category Group/Category', 'Category Group',  'Category',  'Memo',  'Outflow', 'Inflow', 'Cleared'],
      data: transactions.map(trans => {
        const account = trans.account;
        const flag = trans.flag;
        const date = trans.date;
        const payee = trans.payee;
        const category = trans.category;
        const memo = trans.memo;
        const outflow = trans.outflow;
        const inflow = trans.inflow;
        const cleared = trans.cleared;

        return [
          account,
          flag,
          date,
          payee,
          category,
          category,
          category,
          memo,
          outflow,
          inflow,
          cleared
        ];
      })
    });
  }

  function _buildBudgetCsv(months) {
    
  }

  function _package(transactionsCsv, budgetCsv) {

  }

  function _download(zipBlob) {

  }

  return {
    create,
    _package,
    _buildTransactionsCsv,
    _buildBudgetCsv
  }
});
