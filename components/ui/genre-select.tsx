'use client'

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from './select'

type Option = {
  label: string
  value: string
}

interface GenreSelectProps {
  options: Option[]
  onChange: (value: string) => void
  placeholder?: string
}

export default function GenreSelect({
  options,
  onChange,
  placeholder = 'Select genre...',
}: GenreSelectProps) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}


