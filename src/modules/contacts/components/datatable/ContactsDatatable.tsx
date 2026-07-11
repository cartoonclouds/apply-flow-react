import Datatable from "@/components/ui/data-table/data-table";
import { db } from "@/db";
import React, { useEffect, useState } from "react";
import { ContactRepository } from "../../repositories/ContactRepository";
import type { Contact } from "../../types";
import { columns } from "./ContactsColumns";

function ContactsDatatable() {
  const [contactsData, setContactsData] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const contactRepository = new ContactRepository(db);

    void contactRepository
      .list()
      .then((data) => {
        setContactsData(data);
        setError(null);
      })
      .catch((caught) => {
        const message =
          caught instanceof Error ? caught.message : "Failed to load data";
        setError(message);
        console.error(caught);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading contacts...</div>;
  }

  if (error) {
    return <div>Failed to load contacts: {error}</div>;
  }

  return <Datatable columns={columns} data={contactsData} />;
}

export default ContactsDatatable;
