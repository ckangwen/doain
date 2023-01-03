import { Component } from "vue";

type FormSlot = (options: { value: any }) => Component;
type TableSlot = (options: { row: any; column: any; $index: number }) => Component;

export interface PaginationViewComponents {
  form: Record<string, FormSlot>;
  table: Record<string, TableSlot>;
}

let _paginationViewComponents: PaginationViewComponents = {
  form: {},
  table: {},
};

export const registerPaginationViewGlobalSlots = (components: PaginationViewComponents) => {
  _paginationViewComponents = components;
};

export const getPaginationViewComponents = () => _paginationViewComponents;
