import type { Prize } from "@raffle_v2/shared";
import {
  Button,
  Chip,
  cn,
  DataTable,
  type DataTableColumn,
  Input,
  Label,
  Select,
} from "@raffle_v2/ui";
import { Edit, Gift, Plus, Trash2, Trophy } from "lucide-react";
import { useState } from "react";
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

type PrizeFormValues = {
  id: string;
  prize: string;
  numberOfWinners: number;
  sponsor: string;
  type: string;
  imageUrl: string;
  sponsorImage: string;
  raffleMode: "Live" | "Pre-draw";
};

function createPrizeColumns({
  onEdit,
  onDelete,
  deletePending,
}: {
  onEdit: (prize: Prize) => void;
  onDelete: (id: string) => void;
  deletePending: boolean;
}): DataTableColumn<Prize>[] {
  return [
    {
      id: "prize",
      header: "Prize Name",
      cell: (prize) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-tr-outline-variant/40 bg-tr-surface-container p-1">
            <div className="flex h-6 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-tr-outline-variant/30 bg-white p-0.5">
              {prize.sponsorImage ? (
                <img
                  src={prize.sponsorImage}
                  alt={`${prize.sponsor ?? "Sponsor"} logo`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="font-label text-[9px] font-bold uppercase text-tr-secondary">
                  {(prize.sponsor ?? "NA")
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")}
                </span>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-tr-on-surface">{prize.prize}</p>
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <p className="truncate text-[11px] font-mono text-tr-on-surface-variant/80">
                {prize.sponsor ?? "No sponsor"}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "prize-image",
      header: "Prize Image",
      align: "center",
      cell: (prize) => (
        <div className="text-center">
          {prize.imageUrl ? (
            <img
              src={prize.imageUrl}
              alt={prize.prize}
              loading="lazy"
              decoding="async"
              className="mx-auto h-full w-12 object-contain"
            />
          ) : (
            <Gift
              className="mx-auto h-5 w-5 text-center text-tr-on-surface-variant/60"
              aria-hidden="true"
            />
          )}
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      align: "center",
      cell: (prize) => <Chip>{prize.type}</Chip>,
    },
    {
      id: "number-of-items",
      header: "Items Left / Total",
      align: "center",
      cell: (prize) => (
        <Chip variant="outline">
          {prize.numberOfItemsLeft ?? prize.numberOfWinners}/{prize.numberOfWinners} items
        </Chip>
      ),
    },
    {
      id: "action",
      header: "Actions",
      align: "center",
      cell: (prize) => (
        <>
          <Button
            disabled={deletePending}
            onClick={() => onEdit(prize)}
            className={cn(
              "px-1 py-2 text-xs text-secondary-container uppercase tracking-wider transition-all shadow-none",
              "bg-inherit",
            )}
          >
            <Edit className="w-5 transition-all hover:scale-110 hover:text-secondary-container/95" />
          </Button>
          <Button
            disabled={deletePending}
            onClick={() => onDelete(prize.id)}
            className={cn(
              "px-1 py-2 text-xs text-error-container uppercase tracking-wider transition-all shadow-none",
              "bg-inherit",
            )}
          >
            <Trash2 className="w-5 transition-all hover:scale-110 hover:text-error-container/80" />
          </Button>
        </>
      ),
    },
  ];
}

function toPrizeFormValues(prize: Prize | PrizeFormValues): PrizeFormValues {
  return {
    id: prize.id,
    prize: prize.prize,
    numberOfWinners: prize.numberOfWinners,
    sponsor: prize.sponsor ?? "",
    type: prize.type ?? "",
    imageUrl: prize.imageUrl ?? "",
    sponsorImage: prize.sponsorImage ?? "",
    raffleMode: prize.raffleMode === "Pre-draw" ? "Pre-draw" : "Live",
  };
}

function toPrizePayload(values: PrizeFormValues) {
  return {
    ...values,
    imageUrl: values.imageUrl || null,
    sponsorImage: values.sponsorImage || null,
  };
}

export function Prizes() {
  const [formError, setFormError] = useState("");
  const table = useTableState({ pageSize: 10 });
  const confirmationModal = useConfirmationModal();
  const formModal = useModal<PrizeFormValues>();
  const form = useForm<PrizeFormValues>({
    id: "",
    prize: "",
    numberOfWinners: 0,
    sponsor: "",
    type: "",
    imageUrl: "",
    sponsorImage: "",
    raffleMode: "Live",
  });

  const deletePrize = useDeletePrize();
  const createPrize = useCreatePrize();
  const updatePrize = useUpdatePrize();

  const emptyPrize: PrizeFormValues = {
    id: "",
    prize: "",
    numberOfWinners: 1,
    sponsor: "",
    type: "",
    imageUrl: "",
    sponsorImage: "",
    raffleMode: "Live",
  };

  const { data: prizes, isLoading: isPrizesLoading } = usePrizes({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
  });

  const resetForm = (data: Prize | PrizeFormValues) => {
    form.reset(toPrizeFormValues(data));
  };

  const handleDeletePrize = (id: string) => {
    confirmationModal.openConfirmModal({
      title: "Delete Prize?",
      description: "Are you sure you want to delete this prize?",
      confirmText: "Confirm Delete",
      variant: "danger",
      onConfirm: async () => {
        deletePrize.mutate(id);
      },
    });
  };

  const handleEditPrize = (selectedPrize: Prize) => {
    confirmationModal.openConfirmModal({
      title: "Edit Prize?",
      description: "Are you sure you want to edit this prize?",
      confirmText: "Confirm Edit",
      variant: "info",
      onConfirm: async () => {
        setFormError("");
        resetForm(selectedPrize);
        formModal.openModal(toPrizeFormValues(selectedPrize));
      },
    });
  };

  const handleAddPrize = () => {
    setFormError("");
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
        try {
          if (isEditing) {
            await updatePrize.mutateAsync(toPrizePayload(form.values));
            toast.success("Updated successfully!");
          } else {
            const { id: _id, ...newPrize } = toPrizePayload(form.values);
            await createPrize.mutateAsync(newPrize);
            toast.success("Added successfully!");
          }

          setFormError("");
          resetForm(form.values);
          formModal.closeModal();
        } catch (error) {
          setFormError(error instanceof Error ? error.message : "Unable to save prize.");
          confirmationModal.closeConfirmModal();
        }
      },
    });
  };

  const columns = createPrizeColumns({
    onEdit: handleEditPrize,
    onDelete: handleDeletePrize,
    deletePending: deletePrize.isPending,
  });

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
            {formError && (
              <div
                role="alert"
                className="rounded-md border border-error-container/40 bg-error-container/10 px-4 py-3 text-sm text-error-container"
              >
                {formError}
              </div>
            )}
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
                htmlFor="prize-image-url"
                className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
              >
                Prize image URL
              </Label>
              <Input
                type="url"
                id="prize-image-url"
                autoComplete="url"
                {...form.register("imageUrl")}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-md py-3 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary transition-all"
                placeholder="https://example.com/prize-image.png"
              />
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
              <Label
                htmlFor="sponsor-image-url"
                className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
              >
                Sponsor image URL
              </Label>
              <Input
                type="url"
                id="sponsor-image-url"
                autoComplete="url"
                {...form.register("sponsorImage")}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-md py-3 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary transition-all"
                placeholder="https://example.com/sponsor-logo.png"
              />
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
            <div className="space-y-2">
              <div className="relative flex items-center">
                <Select
                  label="Raffle mode"
                  value={form.values.raffleMode}
                  onChange={(nextValue) => {
                    const mode: PrizeFormValues["raffleMode"] =
                      nextValue === "Pre-draw" ? "Pre-draw" : "Live";
                    form.setValue("raffleMode", mode);
                  }}
                  options={[
                    { value: "Live", label: "Live" },
                    { value: "Pre-draw", label: "Pre-draw" },
                  ]}
                  placeholder="Choose a raffle mode..."
                />
              </div>
            </div>
          </form>
        )}
      </Modal>
    </Layout>
  );
}
