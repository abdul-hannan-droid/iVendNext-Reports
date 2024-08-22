frappe.pages["Stimulsoft Dashboard Designer"].on_page_load = function (
  wrapper
) {
  var page = frappe.ui.make_app_page({
    parent: wrapper,
    title: "Stimulsoft Dashboard Designer",
    single_column: true,
  });

  // Add a placeholder for the designer
  page.wrapper.html(
    `<div id="designer-container" style="width: 100%; height: 100vh; padding: 20px;">Loading...</div>`
  );

  StiOptions.WebServer.url = "http://localhost:9615";

  var date_fields = ["Date", "Datetime", "Time"];
  var number_fields = ["Currency", "Duration", "Float", "Int", "Rating"];
  var string_fields = [
    "Color",
    "Phone",
    "Data",
    "HTML",
    "Link",
    "Select",
    "Signature",
    "Small Text",
    "Text",
  ];

  var options = new Stimulsoft.Designer.StiDesignerOptions();
  options.dictionary.dataSourcesPermissions =
    Stimulsoft.Designer.StiDesignerPermissions.View;
  options.dictionary.dataRelationsPermissions =
    Stimulsoft.Designer.StiDesignerPermissions.View;
  options.dictionary.showAdaptersInNewConnectionForm = false;
  options.dictionary.dataConnectionsPermissions =
    Stimulsoft.Designer.StiDesignerPermissions.View;

  // Create the dashboard designer with default options and show it in this place
  var designer = new Stimulsoft.Designer.StiDesigner(
    options,
    "StiDesigner",
    false
  );

  console.log(designer);

  // Create a new dashboard instance
  var report = Stimulsoft.Report.StiReport.createNewDashboard();

  report.dictionary.databases.clear();

  frappe.call({
    method:
      "ivendnext_reports.ivendnext_reports.page.ivendnext_reports.get_config",
    callback: function (r) {
      console.log(r);

      report.dictionary.databases.add(
        new Stimulsoft.Report.Dictionary.StiMySqlDatabase(
          "Connection",
          "Connection",
          `server=${r.message.db_host};database=${r.message.db_name};userid=${r.message.db_name};pwd=${r.message.db_password};Port=${r.message.db_port}`
        )
      );

      frappe.call({
        method:
          "ivendnext_reports.ivendnext_reports.page.ivendnext_reports.get_datasources",
        callback: (r) => {

          if (r.message.length == 0) {
            document.getElementById("designer-container").innerHTML =
              "Please add Datasources to Continue";
          }

          r.message.forEach((db) => {
            table = new Stimulsoft.Report.Dictionary.StiMySqlSource(
              "Connection",
              db.name,
              "tab" + db.name,
              "SELECT * FROM `tab" + db.name + "`",
              true,
              false
            );

            report.dictionary.dataSources.add(table);

            db.fields.forEach((field) => {
              const fieldTypeMap = {
                ...Object.fromEntries(
                  string_fields.map((type) => [type, String])
                ),
                ...Object.fromEntries(
                  number_fields.map((type) => [type, Number])
                ),
                ...Object.fromEntries(date_fields.map((type) => [type, Date])),
                Check: Boolean,
              };

              var field_type = fieldTypeMap[field.type];

              if (field_type) {
                table.columns.add(
                  new Stimulsoft.Report.Dictionary.StiDataColumn(
                    field.fieldname,
                    field.fieldname,
                    field.fieldname.replace("_", " "),
                    field_type
                  )
                );
              }
            });

            designer.report = report;
            designer.renderHtml("designer-container");

            var dictionaryPanel = designer.jsObject.options.dictionaryPanel;
            dictionaryPanel.toolBar.controls["Actions"].style.display = "none";
            dictionaryPanel.toolBar.controls["NewItem"].style.display = "none";
          });
        },
      });
    },
  });

  designer.onSaveReport = function (args) {
    args.preventDefault = false;

    frappe.call({
      method:
        "ivendnext_reports.ivendnext_reports.page.ivendnext_reports.save_dashboard",
      args: {
        file_name: args.fileName.split(".mrt")[0],
        json_data: args.report.saveToJsonString(),
      },
      callback: function (r) {},
    });
  };
};
