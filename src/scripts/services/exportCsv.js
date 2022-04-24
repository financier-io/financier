import Papa from "papaparse";
import fileSaver from "file-saver";
import JSZip from "jszip";

angular
  .module("financier")
  .factory("exportCsv", ($translate, $filter, flags) => {
    const intCurrency = $filter("intCurrency"),
      currency = $filter("currency"),
      dateFilter = $filter("date"),
      urlFriendlyDateFilter = (date) => dateFilter(date, "yyyy-MM-dd HHmm");

    function create(payload) {
      return _package(
        _buildTransactionsCsv(payload),
        _buildBudgetCsv(payload),
        payload.budgetName
      ).then((contents) => {
        const date = urlFriendlyDateFilter(new Date());

        return fileSaver.saveAs(
          contents,
          `${$translate.instant("FINANCIER_EXPORT")} - ${$translate.instant(
            "MY_BUDGET_AS_OF",
            { date, budgetName: payload.budgetName }
          )}.zip`
        );
      });
    }

    function _buildTransactionsCsv({
      transactions,
      currencySymbol = "$",
      currencyDigits = 2,
      categories = {},
      masterCategories = {},
      payees = {},
      accounts = [],
    }) {
      return Papa.unparse({
        fields: [
          "ACCOUNT",
          "FLAG",
          "DATE",
          "PAYEE",
          "CATEGORY_GROUP_CATEGORY",
          "CATEGORY_GROUP",
          "CATEGORY",
          "MEMO",
          "OUTFLOW",
          "INFLOW",
          "CLEARED",
        ].map($translate.instant),
        data: transactions
          .filter((trans) => {
            // If not a parent of splits
            return !trans.splits || !trans.splits.length;
          })
          .sort(
            (a, b) => b.date.getTime() + b.value - (a.date.getTime() + a.value)
          )
          .map((trans) => {
            const account = _getAccount(trans.account, accounts);
            const flag = _getFlagColor(
              trans.transaction ? trans.transaction.flag : trans.flag
            );
            const date = dateFilter(trans.date, "shortDate");

            let payee = trans.transaction
              ? payees[trans.transaction.payee] &&
                payees[trans.transaction.payee].name
              : payees[trans.payee] && payees[trans.payee].name;

            if (trans.transfer) {
              const acc = _getAccount(trans.transfer.account, accounts);

              payee = `${$translate.instant("TRANSFER")}: ${acc}`;
            }

            const category = _getCategory(trans, categories);
            const masterCategory = _getMasterCategory(
              trans,
              masterCategories,
              categories
            );

            let categoryCombo;
            if (masterCategory && category) {
              categoryCombo = `${masterCategory}: ${category}`;
            }

            let memo = trans.memo;

            if (trans.transaction) {
              const number = trans.transaction.splits.indexOf(trans) + 1,
                total = trans.transaction.splits.length;

              const initialMemo = memo;

              memo = $translate.instant("SPLIT_N_OF_TOTAL", { number, total });

              if (initialMemo) {
                memo += ` ${initialMemo}`;
              }
            }

            const outflow = currency(
              intCurrency(trans.outflow, false, currencyDigits) || 0,
              currencySymbol,
              currencyDigits
            );

            const inflow = currency(
              intCurrency(trans.inflow, false, currencyDigits) || 0,
              currencySymbol,
              currencyDigits
            );

            const cleared = trans.transaction
              ? $translate.instant(
                  trans.transaction.reconciled
                    ? "RECONCILED"
                    : trans.transaction.cleared
                    ? "CLEARED"
                    : "UNCLEARED"
                )
              : $translate.instant(
                  trans.reconciled
                    ? "RECONCILED"
                    : trans.cleared
                    ? "CLEARED"
                    : "UNCLEARED"
                );

            return [
              account,
              flag,
              date,
              payee,
              categoryCombo,
              masterCategory,
              category,
              memo,
              outflow,
              inflow,
              cleared,
            ];
          }),
      });
    }

    function _buildBudgetCsv({
      months,
      currencySymbol = "$",
      currencyDigits = 2,
      // categories = {},
      masterCategories = {},
    }) {
      const data = [];

      const sortedMasterCategories = Object.keys(masterCategories)
        .map((id) => masterCategories[id])
        .sort((a, b) => a.sort - b.sort);

      for (let i = 0; i < months.length; i++) {
        const month = dateFilter(months[i].date, "MMM yyyy");

        for (let j = 0; j < sortedMasterCategories.length; j++) {
          for (
            let k = 0;
            k < sortedMasterCategories[j].categories.length;
            k++
          ) {
            const catId = sortedMasterCategories[j].categories[k].id,
              categoryCombo = `${sortedMasterCategories[j].name}: ${sortedMasterCategories[j].categories[k].name}`;

            let budget, outflow, balance;

            if (months[i].categories[catId]) {
              budget = currency(
                intCurrency(
                  months[i].categories[catId].budget,
                  false,
                  currencyDigits
                ) || 0,
                currencySymbol,
                currencyDigits
              );
            } else {
              budget = currency(0, currencySymbol, currencyDigits);
            }

            if (months[i].categoryCache[catId]) {
              outflow = currency(
                intCurrency(
                  months[i].categoryCache[catId].outflow,
                  false,
                  currencyDigits
                ) || 0,
                currencySymbol,
                currencyDigits
              );
              balance = currency(
                intCurrency(
                  months[i].categoryCache[catId].balance,
                  false,
                  currencyDigits
                ) || 0,
                currencySymbol,
                currencyDigits
              );
            } else {
              outflow = currency(0, currencySymbol, currencyDigits);
              balance = currency(0, currencySymbol, currencyDigits);
            }

            data.push([
              month,
              categoryCombo,
              sortedMasterCategories[j].name,
              sortedMasterCategories[j].categories[k].name,
              budget,
              outflow,
              balance,
            ]);
          }
        }
      }

      return Papa.unparse({
        fields: [
          "MONTH",
          "CATEGORY_GROUP_CATEGORY",
          "CATEGORY_GROUP",
          "CATEGORY",
          "BUDGETED",
          "OUTFLOWS",
          "BALANCE",
        ].map($translate.instant),
        data,
      });
    }

    function _package(transactionsCsv, budgetCsv, budgetName) {
      var zip = new JSZip();

      const date = urlFriendlyDateFilter(new Date());

      zip.file(
        `${$translate.instant("MY_BUDGET_AS_OF", {
          date,
          budgetName,
        })} - ${$translate.instant("REGISTER")}.csv`,
        transactionsCsv
      );
      zip.file(
        `${$translate.instant("MY_BUDGET_AS_OF", {
          date,
          budgetName,
        })} - ${$translate.instant("BUDGET")}.csv`,
        budgetCsv
      );

      return zip.generateAsync({ type: "blob" });
    }

    function _getFlagColor(color) {
      for (let i = 0; i < flags.length; i++) {
        if (flags[i].color === color) {
          return $translate.instant(flags[i].label);
        }
      }
    }

    function _getCategory(transaction, categories) {
      if (categories[transaction.category]) {
        return categories[transaction.category].name;
      }

      if (
        transaction.category === "income" ||
        transaction.category === "incomeNextMonth"
      ) {
        return $translate.instant("INCOME_FOR", {
          month: dateFilter(transaction.month, "LLLL"),
        });
      }
    }

    function _getMasterCategory(transaction, masterCategories, categories) {
      if (
        categories[transaction.category] &&
        categories[transaction.category].masterCategory
      ) {
        return masterCategories[categories[transaction.category].masterCategory]
          .name;
      }

      if (
        transaction.category === "income" ||
        transaction.category === "incomeNextMonth"
      ) {
        return $translate.instant("INCOME");
      }
    }

    function _getAccount(id, accounts) {
      for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].id === id) {
          return accounts[i].name;
        }
      }
    }

    return {
      create,
      _package,
      _buildTransactionsCsv,
      _buildBudgetCsv,
      _getFlagColor,
      _getCategory,
    };
  });
