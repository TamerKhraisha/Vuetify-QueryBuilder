<template>
  <v-card flat>
    <v-card-title class="black white--text headline mb-3">
      Vuetify Query Builder
    </v-card-title>
    <v-card-text>
      <span
        style="font-family: Francois One !important"
        class="subtitle-1 mt-5 mb-5"
        >FROM</span
      >
      <v-select
        v-model="selectedTable"
        dense
        :items="tables"
        label="Select the table you want to query"
        outlined
        class="mt-5"
      ></v-select>
      <span style="font-family: Francois One !important" class="subtitle-1"
        >SELECT</span
      >
      <v-divider class="mb-3 mt-3"></v-divider>
      <v-row
        class="mt-5 mb-5"
        justify="space-between"
        align="center"
        no-gutters
      >
        <v-col cols="5">
          <v-list
            style="max-height:500px"
            class="overflow-y-auto"
            two-line
            subheader
          >
            <v-list-item>
              <div
                style="width:100%"
                class="d-flex justify-space-between align-center"
              >
                <span style="color:#17a7c1" class="font-weight-bold grey--text"
                  >Available Columns ({{ columns.length }})</span
                >
                <v-btn
                  @click="addAllColumns"
                  class="caption"
                  small
                  outlined
                  text
                  >Select all columns</v-btn
                >
              </div>
            </v-list-item>
            <v-list-item>
              <v-text-field
                append-icon="mdi-magnify"
                label="Filter"
              ></v-text-field>
            </v-list-item>
            <v-list-item v-for="item in columns" :key="item.colName">
              <v-list-item-content>
                <v-list-item-title v-text="item.colName"></v-list-item-title>
                <v-list-item-subtitle
                  >This is the description of the column.</v-list-item-subtitle
                >
              </v-list-item-content>

              <v-list-item-action>
                <v-icon
                  class="ma-0 pa-0"
                  v-if="addedColumns.includes(item)"
                  color="green lighten-1"
                  >mdi-check-circle</v-icon
                >
                <v-btn @click="addColumn(item)" small v-else icon>
                  <v-icon color="green lighten-1">mdi-plus</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-col>

        <v-col cols="5">
          <v-list
            class="overflow-y-auto"
            style="height:500px;max-height:500px"
            two-line
            subheader
          >
            <v-list-item>
              <div
                style="width:100%"
                class="d-flex justify-space-between align-center"
              >
                <span class="font-weight-bold grey--text"
                  >Selected Columns</span
                >
                <v-btn @click="removeAllColumns" small outlined text
                  >Remove all columns</v-btn
                >
              </div>
            </v-list-item>
            <v-list-item>
              <v-text-field
                append-icon="mdi-magnify"
                label="Filter"
              ></v-text-field>
            </v-list-item>
            <v-list-item
              v-for="item in addedColumns"
              :key="item.colName"
              @click="() => {}"
            >
              <v-list-item-content>
                <v-list-item-title v-text="item.colName"></v-list-item-title>
                <v-list-item-subtitle
                  v-text="item.colName"
                ></v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <div>
                  <v-btn @click="addFilter(item)" icon>
                    <v-icon color="secondary lighten-1">mdi-filter</v-icon>
                  </v-btn>
                  <v-btn @click="removeColumns(item)" icon>
                    <v-icon color="red lighten-2">mdi-delete-outline</v-icon>
                  </v-btn>
                </div>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
      <div class="d-flex justify-space-between align-center">
        <span style="font-family: Francois One !important" class="subtitle-1"
          >FILTERS</span
        >
        <v-btn
          style="font-family: Francois One !important"
          @click="addFilter"
          text
        >
          <v-icon>mdi-plus</v-icon>add filter</v-btn
        >
      </div>
      <v-divider></v-divider>
      <div class="mt-7" v-if="addedFilters.length > 0">
        <v-row
          v-for="(filter, index) in addedFilters"
          :key="filter.index"
          align="center"
          justify="start"
          flex-wrap
          no-gutters
        >
          <v-col cols="1">
            <div class="d-flex align-center">
              <v-btn @click="removeFilter(filter.index)" color="error" icon>
                <v-icon>mdi-delete-outline</v-icon>
              </v-btn>
              <v-btn-toggle small v-model="addedFilters[index].andOrOr">
                <v-btn small text value="and">
                  and
                </v-btn>
                <v-btn small text value="or">
                  or
                </v-btn>
              </v-btn-toggle>
            </div>
          </v-col>
          <v-col class="mr-2" cols="2">
            <v-select
              @change="clearFilterDataUponColumnChange(index)"
              dense
              v-model="addedFilters[index].column"
              :items="selectedColumns"
              label="column"
            ></v-select>
          </v-col>
          <v-col v-if="addedFilters[index].column" cols="2">
            <v-select
              dense
              :items="columnFilters(filter.column)"
              v-model="addedFilters[index].filter"
              class="mr-2"
              label="condition"
            ></v-select>
          </v-col>
          <v-col
            v-if="
              addedFilters[index].column &&
                addedFilters[index].filter &&
                ['DATE', 'TIME', 'DATETIME'].includes(
                  colType(addedFilters[index].column)
                ) === false &&
                addedFilters[index].file === null
            "
            class="mr-2"
            cols="1"
          >
            <v-text-field
              :rules="[rules.required]"
              autocomplete="new-value"
              label="value"
              v-model="addedFilters[index].inputField1"
              dense
            ></v-text-field>
          </v-col>
          <v-col
            v-if="
              addedFilters[index].column &&
                addedFilters[index].filter &&
                addedFilters[index].filter === 'between' &&
                colType(addedFilters[index].column) === 'NUMERIC'
            "
            cols="1"
          >
            <div class="d-flex justify-center">
              <span class="text-uppercase">and</span>
            </div>
          </v-col>
          <v-col
            v-if="
              addedFilters[index].column &&
                addedFilters[index].filter &&
                addedFilters[index].filter === 'between' &&
                colType(addedFilters[index].column) === 'NUMERIC'
            "
            cols="1"
          >
            <v-text-field
              required
              label="value"
              v-model="addedFilters[index].inputField2"
              :rules="[rules.required]"
              dense
            ></v-text-field>
          </v-col>
          <v-col
            v-if="
              addedFilters[index].column &&
                addedFilters[index].filter &&
                addedFilters[index].filter == 'in'
            "
            cols="1"
          >
            <div class="d-flex align-center">
              <v-file-input
                dense
                :hide-input="addedFilters[index].file === null"
                v-model="addedFilters[index].file"
                @change="uploadFile($event, index)"
                accept=".txt"
                label="Upload file"
              ></v-file-input>
            </div>
          </v-col>
          <v-col
            v-if="
              addedFilters[index].column &&
                addedFilters[index].filter &&
                addedFilters[index].filter !== 'in' &&
                ['DATE', 'DATETIME'].includes(
                  colType(addedFilters[index].column)
                )
            "
            class="mr-2"
            cols="1"
          >
            <v-menu
              :close-on-content-click="true"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="addedFilters[index].datePicker1"
                  :label="
                    addedFilters[index].filter === 'between'
                      ? 'Start date'
                      : 'date'
                  "
                  readonly
                  v-on="on"
                  dense
                  :rules="[rules.required]"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="addedFilters[index].datePicker1"
                no-title
                scrollable
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col
            v-if="
              addedFilters[index].column &&
                addedFilters[index].filter &&
                addedFilters[index].filter !== 'in' &&
                ['TIME', 'DATETIME'].includes(
                  colType(addedFilters[index].column)
                )
            "
            cols="1"
          >
            <v-menu
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="addedFilters[index].timePicker1"
                  :label="
                    addedFilters[index].filter === 'between'
                      ? 'Start time'
                      : 'time'
                  "
                  readonly
                  v-on="on"
                  dense
                  :rules="[rules.required]"
                ></v-text-field>
              </template>
              <v-time-picker
                v-model="addedFilters[index].timePicker1"
                use-seconds
                format="24hr"
                scrollable
              ></v-time-picker>
            </v-menu>
          </v-col>
          <v-col
            v-if="
              addedFilters[index].column &&
                addedFilters[index].filter &&
                ['DATE', 'DATETIME', 'TIME'].includes(
                  colType(addedFilters[index].column)
                ) &&
                addedFilters[index].filter === 'between'
            "
            cols="1"
          >
            <div class="d-flex justify-center">
              <span class="text-uppercase">and</span>
            </div>
          </v-col>
          <v-col
            v-if="
              addedFilters[index].column &&
                addedFilters[index].filter &&
                ['DATE', 'DATETIME'].includes(
                  colType(addedFilters[index].column)
                ) &&
                addedFilters[index].filter === 'between'
            "
            cols="1"
          >
            <v-menu
              :close-on-content-click="true"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="addedFilters[index].datePicker2"
                  label="End date"
                  readonly
                  v-on="on"
                  dense
                  :rules="[rules.required]"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="addedFilters[index].datePicker2"
                no-title
                scrollable
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col
            v-if="
              addedFilters[index].column &&
                addedFilters[index].filter &&
                ['TIME', 'DATETIME'].includes(
                  colType(addedFilters[index].column)
                ) &&
                addedFilters[index].filter === 'between'
            "
            class="ml-2"
            cols="1"
          >
            <v-menu
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="addedFilters[index].timePicker2"
                  label="End time"
                  readonly
                  v-on="on"
                  dense
                  :rules="[rules.required]"
                ></v-text-field>
              </template>
              <v-time-picker
                use-seconds
                v-model="addedFilters[index].timePicker2"
                format="24hr"
                scrollable
              ></v-time-picker>
            </v-menu>
          </v-col>
        </v-row>
      </div>
      <div class="mt-5">
        <span
          style="font-family: Francois One !important"
          class="subtitle-1 mb-5"
          >LIMIT</span
        >
        <v-divider></v-divider>
        <v-form v-model="validRowNumberForm">
          <v-text-field
            outlined
            dense
            label="Specify the number of records to return"
            class="mt-5"
            required
            v-model="numberRows"
            :rules="[rules.required, rules.maxAndIntQueryRows]"
          ></v-text-field>
        </v-form>
      </div>
      <div class="mt-5">
        <span
          style="font-family: Francois One !important"
          class="subtitle-1 text-uppercase"
          >query preview</span
        >
        <v-divider></v-divider>

        <pre class="pb-5 pt-2" v-text="query"></pre>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "QueryBuilder",
  data() {
    return {
      addedFilters: [],
      filterIndex: 0,
      columnSearch: "",
      validRowNumberForm: true,
      validFilters: false,
      numberRows: 10000,
      addedColumns: [],
      file: "",
      rules: {
        required: value => !!value || "Required.",
        maxAndIntQueryRows: value =>
          (!!parseInt(value) && value >= 0 && value <= 10000) ||
          "Please insert a number between 1 and 10000 rows"
      },
      selectAllColumns: false,
      columnNames: [
        "Date Column 1",
        "Numeric Column 1",
        "Numeric Column 2",
        "String Column 1",
        "String Column 2",
        "Time Column 1",
        "Datetime Column 1"
      ],
      tables: ["Table1", "Table2", "Table3", "Table4"],
      filters: [
        "equal",
        "not equal",
        "greater than",
        "less than",
        "between",
        "in"
      ],
      selectedTable: null,
      columns: [
        {
          colName: "Date Column 1",
          type: "DATE",
          desc: "this is a description of the column"
        },
        {
          colName: "Numeric Column 1",
          type: "NUMERIC",
          desc: "this is a description of the column"
        },
        {
          colName: "Numeric Column 2",
          type: "NUMERIC",
          desc: "this is a description of the column"
        },
        {
          colName: "String Column 1",
          type: "CHARACTER",
          desc: "this is a tamer of the column"
        },
        {
          colName: "Date Column 2",
          type: "DATE",
          desc: "this is a john description of the column"
        },
        {
          colName: "String Column 2",
          type: "CHARACTER",
          desc: "this is a description of the column"
        },
        {
          colName: "Time Column 1",
          type: "TIME",
          desc: "this is a description of the column"
        },
        {
          colName: "Datetime Column 1",
          type: "DATETIME",
          desc: "this is a description of the column"
        }
      ],
      operators: {
        "greater than": ">",
        "less than": "<",
        equal: "==",
        "not equal": "!==",
        in: "in",
        between: "between"
      }
    };
  },
  methods: {
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${month}/${day}/${year}`;
    },
    addColumn: function(colData) {
      if (this.$data.addedColumns.includes(colData) === false) {
        this.$data.addedColumns.push(colData);
      }
    },
    addAllColumns: function() {
      this.$data.addedColumns = Array.from(this.$data.columns);
    },
    removeColumns: function(colData) {
      const index = this.$data.addedColumns.indexOf(colData);
      if (index > -1) {
        this.$data.addedColumns.splice(index, 1);
      }
      this.$data.addedFilters = this.$data.addedFilters.filter(
        filter => filter.column !== colData.colName
      );
    },
    removeAllColumns: function() {
      this.$data.addedColumns = [];
    },
    parseDate(date) {
      if (!date) return null;

      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    loadTextFromFile(ev) {
      const file = ev.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.setFileContentForFilter(e.target.result);
      reader.readAsText(file);
    },
    uploadFile(evt, filterIdx) {
      console.log(evt);
      if (evt !== undefined && evt !== null) {
        var reader = new FileReader();
        reader.readAsText(evt);
        reader.onload = () => {
          this.setFileContentForFilter(reader.result, filterIdx);
        };
      } else {
        this.$data.addedFilters[filterIdx].fileContent = null;
        this.$data.addedFilters[filterIdx].file = null;
        this.$data.addedFilters[filterIdx].inputField1 = null;
      }
    },
    setFileContentForFilter(fileData, filterIdx) {
      console.log("setting data");
      const filter = this.$data.addedFilters[filterIdx];
      var formatterData;
      if (filter && this.colType(filter.column) === "NUMERIC") {
        formatterData = fileData
          .split("\n")
          .map(dataPoint => parseInt(dataPoint));
      } else {
        formatterData = fileData
          .split("\n")
          .map(dataPoint => dataPoint.toString());
      }
      this.$data.addedFilters[filterIdx].fileContent = formatterData;
      this.$data.addedFilters[filterIdx].inputField1 = formatterData;
    },
    addFilter(colData = null) {
      let id = this.$data.filterIndex;
      let filterData = {
        index: id,
        column: null,
        andOrOr: "and",
        filter: null,
        inputField1: null,
        inputField2: null,
        datePicker1: null,
        datePicker2: null,
        timePicker1: null,
        timePicker2: null,
        file: null,
        fileContent: null
      };
      if (colData !== null) {
        filterData.column = colData.colName;
      }
      this.$data.addedFilters.push(filterData);
      this.$data.filterIndex += 1;
    },
    removeFilter(filterIndex) {
      this.$data.addedFilters = this.$data.addedFilters.filter(
        filter => filter.index !== filterIndex
      );
    },
    clearFilterDataUponColumnChange(filterArrayIndex) {
      this.$data.addedFilters[filterArrayIndex].filter = null;
      this.$data.addedFilters[filterArrayIndex].inputField1 = null;
      this.$data.addedFilters[filterArrayIndex].inputField2 = null;
      this.$data.addedFilters[filterArrayIndex].datePicker1 = null;
      this.$data.addedFilters[filterArrayIndex].datePicker2 = null;
      this.$data.addedFilters[filterArrayIndex].timePicker1 = null;
      this.$data.addedFilters[filterArrayIndex].timePicker2 = null;
      this.$data.addedFilters[filterArrayIndex].fileContent = null;
    },
    colType(col) {
      if (col) {
        const colData = this.$data.columns.find(item => item.colName === col);
        return colData.type;
      }
    },
    columnFilters(col) {
      if (col !== null && col !== undefined) {
        const colData = this.$data.columns.find(item => item.colName === col);
        if (
          ["NUMERIC", "DATE", "TIME", "DATETIME"].includes(colData.type) ===
          true
        ) {
          return [
            "equal",
            "not equal",
            "greater than",
            "less than",
            "between",
            "in"
          ];
        } else if (colData.type === "CHARACTER") {
          return ["equal", "not equal", "in"];
        }
      } else {
        return [];
      }
    }
  },
  computed: {
    computedDateFormatted() {
      return this.formatDate(this.date);
    },
    query() {
      const selectStatement =
        this.$data.addedColumns.length === this.$data.columns.length
          ? "SELECT *"
          : `SELECT ${this.selectedColumns.map(col => `"${col}"`).join(", ")}` +
            `\nFROM ${this.$data.selectedTable}`;
      if (this.$data.addedFilters.length > 0) {
        let conditionsStatement = this.$data.addedFilters.map(
          (filter, index) => {
            let statement =
              index > 0
                ? `${filter.andOrOr} "${filter.column}"`
                : `"${filter.column}"`;
            if (
              ["equal", "not equal", "greater than", "less than"].includes(
                filter.filter
              ) &&
              this.colType(filter.column) === "NUMERIC"
            ) {
              statement = `${statement} ${
                this.$data.operators[filter.filter]
              } ${filter.inputField1}`;
              return statement;
            } else if (
              ["equal", "not equal"].includes(filter.filter) &&
              this.colType(filter.column) === "CHARACTER"
            ) {
              statement = `${statement} ${
                this.$data.operators[filter.filter]
              } '${filter.inputField1}'`;
              return statement;
            } else if (
              ["equal", "not equal", "greater than", "less than"].includes(
                filter.filter
              ) &&
              this.colType(filter.column) === "DATE"
            ) {
              statement = `${statement} ${
                this.$data.operators[filter.filter]
              } '${filter.datePicker1}'`;
              return statement;
            } else if (
              filter.filter === "between" &&
              this.colType(filter.column) === "DATE"
            ) {
              statement = `${statement} ${
                this.$data.operators[filter.filter]
              } '${filter.datePicker1}' and '${filter.datePicker2}'`;
              return statement;
            } else if (
              ["equal", "not equal", "greater than", "less than"].includes(
                filter.filter
              ) &&
              this.colType(filter.column) === "TIME"
            ) {
              statement = `${statement} ${
                this.$data.operators[filter.filter]
              } '${filter.timePicker1}'`;
              return statement;
            } else if (
              filter.filter === "between" &&
              this.colType(filter.column) === "TIME"
            ) {
              statement = `${statement} ${
                this.$data.operators[filter.filter]
              } '${filter.timePicker1}' and '${filter.timePicker2}'`;
              return statement;
            } else if (
              ["equal", "not equal", "greater than", "less than"].includes(
                filter.filter
              ) &&
              this.colType(filter.column) === "DATETIME"
            ) {
              statement = `${statement} ${
                this.$data.operators[filter.filter]
              } '${filter.datePicker1} ${filter.timePicker1}'`;
              return statement;
            } else if (
              filter.filter === "between" &&
              this.colType(filter.column) === "DATETIME"
            ) {
              statement = `${statement} ${
                this.$data.operators[filter.filter]
              } '${filter.datePicker1} ${filter.timePicker1}' and '${
                filter.datePicker2
              } ${filter.timePicker2}'`;
              return statement;
            } else if (
              filter.filter === "between" &&
              this.colType(filter.column) === "NUMERIC"
            ) {
              statement = `${statement} ${
                this.$data.operators[filter.filter]
              } '${filter.inputField1}' and '${filter.inputField2}'`;
              return statement;
            } else if (filter.filter === "in") {
              statement = `${statement} ${
                this.$data.operators[filter.filter]
              } (${filter.fileContent})`;
              return statement;
            }
          }
        );
        return (
          selectStatement +
          "\nWHERE " +
          conditionsStatement.join("\n") +
          `\nlimit ${this.$data.numberRows}`
        );
      }
      return selectStatement + `\nlimit ${this.$data.numberRows}`;
    },
    columnData() {
      if (this.$data.columnSearch) {
        return this.$data.columns.filter(
          column =>
            column.colName
              .toLowerCase()
              .includes(this.$data.columnSearch.toLowerCase()) ||
            column.desc.includes(this.$data.columnSearch)
        );
      }
      return this.$data.columns;
    },
    selectedColumns() {
      if (this.$data.addedColumns) {
        return this.$data.addedColumns.map(column => column.colName);
      }
      return [];
    }
  }
};
</script>
