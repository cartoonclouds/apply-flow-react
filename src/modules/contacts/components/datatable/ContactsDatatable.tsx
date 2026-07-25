import { Button } from "@/components/ui/button";
import Datatable from "@/components/ui/data-table/data-table";
import { db } from "@/db";
import { useToast } from "@/modules/notifications/context/ToastContext";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ContactRepository } from "../../repositories/ContactRepository";
import type { Contact } from "../../types";
import type { ContactFormValues } from "../forms/ContactForm";
import ContactModal from "../modal/ContactModal";
import { getContactColumns } from "./ContactsColumns";

type CompanyOption = {
  id: string;
  name: string;
};

function ContactsDatatable() {
  const [contactsData, setContactsData] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { notify } = useToast();

  const contactRepository = useMemo(() => new ContactRepository(db), []);

  const columns = useMemo(
    () =>
      getContactColumns({
        onOpenContact: (contact) => {
          setSelectedContact(contact);
          setModalMode("edit");
          setModalOpen(true);
        },
        onDeleteContact: (contact) => {
          void handleDelete(contact);
        },
      }),
    [],
  );

  const loadContacts = useCallback(async () => {
    const data = await contactRepository.list();
    setContactsData(data);
    setError(null);
  }, [contactRepository]);

  const loadCompanies = useCallback(async () => {
    const companyRows = await db.query.companies.findMany();
    setCompanies(
      companyRows.map((company) => ({ id: company.id, name: company.name })),
    );
  }, []);

  useEffect(() => {
    void Promise.all([loadContacts(), loadCompanies()])
      .catch((caught) => {
        const message =
          caught instanceof Error ? caught.message : "Failed to load data";
        setError(message);
        console.error(caught);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loadContacts, loadCompanies]);

  function openCreateModal() {
    setModalMode("create");
    setSelectedContact(null);
    setModalOpen(true);
  }

  async function handleSubmit(values: ContactFormValues) {
    try {
      if (modalMode === "create") {
        await contactRepository.create({
          id: crypto.randomUUID(),
          fullName: values.fullName,
          companyId: values.companyId,
          email: values.email,
          phone: values.phone,
          linkedinUrl: values.linkedinUrl,
          type: values.type,
          locationText: values.locationText,
          notes: values.notes,
        } as any);

        notify({
          title: "Contact created",
          description: `${values.fullName} was added successfully.`,
          variant: "success",
        });
      } else if (selectedContact) {
        await contactRepository.update(selectedContact.id, {
          fullName: values.fullName,
          companyId: values.companyId,
          email: values.email,
          phone: values.phone,
          linkedinUrl: values.linkedinUrl,
          type: values.type,
          locationText: values.locationText,
          notes: values.notes,
        } as any);

        notify({
          title: "Contact updated",
          description: `${values.fullName} was saved successfully.`,
          variant: "success",
        });
      }

      await loadContacts();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);

      notify({
        title: "Could not save contact",
        description: message,
        variant: "error",
      });

      throw caught;
    }
  }

  async function handleDelete(contact: Contact, rethrow = false) {
    const shouldDelete = window.confirm(
      `Delete contact \"${contact.fullName}\"? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await contactRepository.delete(contact.id);
      await loadContacts();

      notify({
        title: "Contact deleted",
        description: `${contact.fullName} was removed.`,
        variant: "success",
      });

      setSelectedContact((current) => {
        if (current?.id !== contact.id) {
          return current;
        }

        setModalOpen(false);
        setModalMode("create");
        return null;
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);

      notify({
        title: "Could not delete contact",
        description: message,
        variant: "error",
      });

      if (rethrow) {
        throw caught;
      }
    }
  }

  if (loading) {
    return <div>Loading contacts...</div>;
  }

  if (error) {
    return <div>Failed to load contacts: {error}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          className=""
          type="button"
          variant="outline"
          size="sm"
          onClick={openCreateModal}
        >
          New Contact
        </Button>
      </div>

      <Datatable
        columns={columns}
        data={contactsData}
        onRowClick={(contact) => {
          setSelectedContact(contact);
          setModalMode("edit");
          setModalOpen(true);
        }}
      />

      <ContactModal
        open={modalOpen}
        mode={modalMode}
        contact={selectedContact}
        companies={companies}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
        onDelete={async () => {
          if (!selectedContact) {
            return;
          }

          await handleDelete(selectedContact, true);
        }}
      />
    </div>
  );
}

export default ContactsDatatable;
