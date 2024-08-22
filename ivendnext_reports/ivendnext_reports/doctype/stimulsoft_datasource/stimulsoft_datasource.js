// Copyright (c) 2024, Abdul Hannan Shaikh and contributors
// For license information, please see license.txt

frappe.ui.form.on("Stimulsoft Datasource", {
  refresh(frm) {
    frm.add_custom_button(__("Get Fields"), () => {
      frm.trigger("set_table");
    });
    frm.trigger("set_fields");
  },

  datasource_doctype: (frm) => {
    frm.trigger("set_table");
  },

  set_table(frm) {
    let update_options = (options) => {
      [frm.fields_dict.fields.grid].forEach((obj) => {
        obj.update_docfield_property("fieldname", "options", options);
      });
    };

    if (frm.doc.datasource_doctype) {
      let added_fields = (frm.doc.fields || []).map((d) => d.fieldname);

      get_fields_for_doctype(frm.doc.datasource_doctype).then((fields) => {
        let as_select_option = (df) => ({
          label: df.label,
          value: df.fieldname,
        });
        update_options(fields.map(as_select_option));

        for (let df of fields) {
          if (
            !df.hidden &&
            !added_fields.includes(df.fieldname) &&
            ![
              "Tab Break",
              "Page Break",
              "Section Break",
              "Table",
              "Attach Image",
              "Attach",
            ].includes(df.fieldtype)
          ) {
            frm.add_child("fields", {
              fieldname: df.fieldname,
              type: df.fieldtype,
            });
          }
        }
        frm.refresh_field("fields");
      });
    }
  },

  set_fields(frm) {
    let update_options = (options) => {
      [frm.fields_dict.fields.grid].forEach((obj) => {
        obj.update_docfield_property("fieldname", "options", options);
      });
    };

    if (frm.doc.datasource_doctype) {
      get_fields_for_doctype(frm.doc.datasource_doctype).then((fields) => {
        let as_select_option = (df) => ({
          label: df.label,
          value: df.fieldname,
        });
        update_options(fields.map(as_select_option));
      });
    }
  },
});

function get_fields_for_doctype(doctype) {
  return new Promise((resolve) =>
    frappe.model.with_doctype(doctype, resolve)
  ).then(() => {
    return frappe.meta.get_docfields(doctype).filter((df) => {
      return (
        ((frappe.model.is_value_type(df.fieldtype) &&
          !["lft", "rgt"].includes(df.fieldname)) ||
          ["Table", "Table Multiselect"].includes(df.fieldtype) ||
          frappe.model.layout_fields.includes(df.fieldtype)) &&
        !["Section Break", "Column Break", "Page Break"].includes(df.fieldtype)
      );
    });
  });
}

frappe.ui.form.on("Stimulsoft Datasource Table", {
  fieldname: (frm, doctype, name) => {
    let doc = frappe.get_doc(doctype, name);
    let df = frappe.meta.get_docfield(
      frm.doc.datasource_doctype,
      doc.fieldname
    );
    if (!df) return;
    doc.type = df.fieldtype;
    frm.refresh_field("fields");
  },
});
