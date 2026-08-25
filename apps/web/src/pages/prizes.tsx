import type { Prize } from "@raffle_v2/shared";
import { Button, cn, DataTable, type DataTableColumn, Input, Label, Select } from "@raffle_v2/ui";
import { Edit, Gift, Loader2, Plus, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { SubmitButton } from "../components/Button/SubmitButton";
import ConfirmationModal from "../components/Custom/ConfirmationModal";
import Layout from "../components/layout";
import { Modal } from "../components/Modals/Modal";
import { useTableState } from "../hooks/datatable/use-table-state";
import { useForm } from "../hooks/form/useForm";
import { useModal } from "../hooks/modal/useModal";
import { useConfirmationModal } from "../hooks/use-confirmation-modal";
import { useCreatePrize, useDeletePrize, usePrizes, useUpdatePrize } from "../hooks/use-prizes";

export function Prizes() {
  const table = useTableState({ pageSize: 5 });
  const confirmationModal = useConfirmationModal();
  const formModal = useModal<Prize>();
  const form = useForm({
    id: "",
    prize: "",
    numberOfWinners: 0,
    sponsor: "",
    type: "",
    imageUrl: null,
    sponsorImage: null,
  });

  const deletePrize = useDeletePrize();
  const createPrize = useCreatePrize();
  const updatePrize = useUpdatePrize();

  const emptyPrize: Prize = {
    id: "",
    prize: "",
    numberOfWinners: 1,
    sponsor: "",
    type: "",
    imageUrl: null,
    sponsorImage: null,
  };

  const { data: prizes, isLoading: isPrizesLoading } = usePrizes({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
  });

  const resetForm = (data: Prize) => {
    form.reset({
      id: data.id,
      prize: data.prize,
      numberOfWinners: data.numberOfWinners,
      sponsor: data.sponsor ?? "",
      type: data.type ?? "",
      imageUrl: null,
      sponsorImage: null,
    });
  };

  const handleDeletePrize = (id: string) => {
    confirmationModal.openConfirmModal({
      title: "Delete Prize?",
      description: "Are you sure you want to delete this prize?",
      confirmText: "Confirm Delete",
      variant: "danger",
      onConfirm: async () => {
        deletePrize.mutate(id);
        toast.success("Deleted successfully!");
      },
    });
  };

  const handleEditPrize = (selectedPrize: Prize) => {
    confirmationModal.openConfirmModal({
      title: "Edit Prize?",
      description: "Are you sure you want to edit this prize?",
      confirmText: "Confirm Edit",
      variant: "warning",
      onConfirm: async () => {
        resetForm(selectedPrize);
        formModal.openModal(selectedPrize);
      },
    });
  };

  const handleAddPrize = () => {
    resetForm(emptyPrize);
    formModal.openModal(emptyPrize);
  };

  const handleSubmit = () => {
    const isEditing = Boolean(form.values.id);
    confirmationModal.openConfirmModal({
      title: isEditing ? "Save Prize?" : "Add Prize?",
      description: isEditing
        ? "Are you sure you want to save this prize?"
        : "Are you sure you want to add this prize?",
      confirmText: isEditing ? "Confirm Save" : "Confirm Add",
      variant: "warning",
      onConfirm: async () => {
        if (isEditing) {
          updatePrize.mutate(form.values);
          toast.success("Updated successfully!");
        } else {
          const { id: _id, ...newPrize } = form.values;
          createPrize.mutate(newPrize);
          toast.success("Added successfully!");
        }
        resetForm(form.values);
        formModal.closeModal();
      },
    });
  };

  const columns: DataTableColumn<Prize>[] = [
    {
      id: "prize",
      header: "Prize Name",
      cell: (prize) => (
        <div>
          <p className="">{prize.prize}</p>
          <p className="mt-0.5 text-[11px] font-mono text-tr-on-surface-variant/80">
            {prize.sponsor}
          </p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      align: "center",
      cell: (prize) => (
        <span className="inline-block rounded-md bg-tr-tertiary px-2.5 py-1 text-xs font-semibold">
          {prize.type}
        </span>
      ),
    },
    {
      id: "number-of-items",
      header: "Number of Items",
      align: "center",
      cell: (prize) => (
        <span className="inline-block rounded-md bg-tr-surface-container-high px-2.5 py-1 text-xs font-semibold uppercase ">
          {prize.numberOfWinners}
        </span>
      ),
    },
    {
      id: "action",
      header: "Actions",
      align: "center",
      cell: (prize) => (
        <>
          <Button
            disabled={deletePrize.isPending}
            onClick={() => handleEditPrize(prize)}
            className={cn(
              "px-2 py-2 text-xs text-secondary-container uppercase tracking-wider transition-all shadow-none",
              "bg-inherit",
            )}
          >
            {deletePrize.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Edit className={" transition-all hover:text-secondary-container/75 w-4"} />
            )}
          </Button>
          <Button
            disabled={deletePrize.isPending}
            onClick={() => handleDeletePrize(prize.id)}
            className={cn(
              "px-2 py-2 text-xs text-error-container uppercase tracking-wider transition-all shadow-none",
              "bg-inherit",
            )}
          >
            {deletePrize.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Trash2 className={" transition-all hover:text-error-container/80 w-4"} />
            )}
          </Button>
        </>
      ),
    },
  ];

  return (
    <Layout pageTitle="Raffle Prizes">
      <DataTable
        columns={columns}
        data={prizes?.data}
        isLoading={isPrizesLoading}
        rowKey={(prize) => prize.id}
        header={{
          icon: Trophy,
          title: "Raffle Prizes",
          subtitle: "Search and process raffle prize distribution records.",
          action: (
            <Button onClick={handleAddPrize} className="gap-2">
              <Plus className="h-4 w-4" />
              Add prize
            </Button>
          ),
        }}
        search={{
          value: table.searchInput,
          onChange: table.setSearchInput,
          placeholder: "Search prize...",
        }}
        pagination={{
          page: table.page,
          totalPages: prizes?.meta.pagination.totalPages ?? 1,
          total: prizes?.meta.pagination.total ?? 0,
          onPageChange: table.setPage,
        }}
        emptyState={{
          icon: Gift,
          title: "No prizes found",
          description: "There are currently no prize records to display.",
          searchDescription: "No results match your search parameters. Try a different query.",
        }}
        footerExtra={(rows) => (
          <span className="text-[10px] font-bold uppercase tracking-wider text-tr-primary">
            {rows.length} items on this page
          </span>
        )}
      />

      <ConfirmationModal {...confirmationModal.modalProps} />

      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title={form.values.id ? "Prize Details" : "Add Prize"}
        description="Enter the prize details, then save when you're done."
        maxWidth="md"
        footer={
          <>
            <SubmitButton type="button" onClick={formModal.closeModal} variant="ghost">
              Cancel
            </SubmitButton>
            <SubmitButton onClick={handleSubmit} variant="primary">
              {form.values.id ? "Save changes" : "Add prize"}
            </SubmitButton>
          </>
        }
      >
        {formModal.data && (
          <form id="edit-prize-form" className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
              >
                Prize
              </Label>
              <div className="relative flex items-center">
                <Input
                  type="text"
                  id="prize"
                  autoComplete="off"
                  {...form.register("prize")}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-md py-3 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary transition-all"
                  placeholder="Enter prize name"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="no-of-items"
                className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
              >
                Number of items
              </Label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  id="no-of-items"
                  autoComplete="off"
                  {...form.register("numberOfWinners")}
                  min={1}
                  step={1}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-md py-3 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary transition-all"
                  placeholder="Enter the number of items"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="sponsored-by"
                className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
              >
                Sponsored by
              </Label>
              <div className="relative flex items-center">
                <Input
                  type="text"
                  id="sponsored-by"
                  autoComplete="off"
                  {...form.register("sponsor")}
                  min={1}
                  step={1}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-md py-3 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary transition-all"
                  placeholder="Enter the name of sponsor"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative flex items-center">
                <Select
                  label="Type"
                  value={form.values.type}
                  onChange={(nextValue) => form.setValue("type", nextValue)}
                  options={[
                    { value: "Minor Prize", label: "Minor Prize" },
                    { value: "Major Prize", label: "Major Prize" },
                  ]}
                  placeholder="Choose a type..."
                />
              </div>
            </div>
          </form>
        )}
      </Modal>
    </Layout>
  );
}
