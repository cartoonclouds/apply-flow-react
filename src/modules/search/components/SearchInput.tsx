import { Field } from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { SearchIcon } from "lucide-react";
import React from "react";

interface SearchInputProps {
  isLoading?: boolean;
}

function SearchInput({ isLoading = false }: SearchInputProps) {
  return (
    <Field className="max-w-sm">
      <InputGroup className={undefined}>
        <InputGroupInput
          className={undefined}
          id="inline-start-input"
          placeholder="Search..."
        />
        <InputGroupAddon className={undefined} align="inline-start">
          <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>

        <InputGroupAddon className={undefined} align="inline-end">
          {isLoading && <Spinner className={undefined} />}
          {!isLoading && <Kbd className={undefined}>⌘K</Kbd>}
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

export default SearchInput;
