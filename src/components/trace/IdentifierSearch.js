import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, Chip, Stack, TextField, Typography } from '@mui/material';
import { useApi } from '../../api/useApi';
import { describeId } from '../../utils/ids';
import { RoleChip } from '../common';

/**
 * Free-text identifier input with suggestions from the graph (searching the object
 * list) and optional example chips.
 */
export default function IdentifierSearch({ value, onChange, onSubmit, examples = [], label = 'Product, lot, case or pallet identifier', autoFocus }) {
  const api = useApi();
  const [input, setInput] = useState(value || '');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => setInput(value || ''), [value]);

  useEffect(() => {
    let active = true;
    const q = input.trim();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const page = await api.trace.objects({ q, limit: 12 });
        if (active) setOptions(page.items || []);
      } catch {
        if (active) setOptions([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 220);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [input, api]);

  const exampleChips = useMemo(() => examples.filter((e) => e && e.id), [examples]);

  return (
    <Box>
      <Autocomplete
        freeSolo
        autoHighlight
        options={options}
        loading={loading}
        inputValue={input}
        onInputChange={(e, v) => setInput(v)}
        getOptionLabel={(o) => (typeof o === 'string' ? o : o.objectID)}
        filterOptions={(x) => x}
        onChange={(e, v) => {
          const id = typeof v === 'string' ? v : v && v.objectID;
          if (id) {
            onChange(id);
            onSubmit && onSubmit(id);
          }
        }}
        renderOption={(props, o) => {
          const d = describeId(o.objectID);
          return (
            <li {...props} key={o.objectID}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
                <RoleChip role={o.role} />
                <Chip size="small" variant="outlined" label={d.kind} sx={{ height: 20, fontSize: 10.5 }} />
                <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.objectID}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {o.eventCount} ev
                </Typography>
              </Stack>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            autoFocus={autoFocus}
            label={label}
            placeholder="https://id.oliot.org/01/…/21/… or urn:epc:id:sgtin:…"
            size="small"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                e.preventDefault();
                onChange(input.trim());
                onSubmit && onSubmit(input.trim());
              }
            }}
            InputProps={{ ...params.InputProps, sx: { fontFamily: '"JetBrains Mono", monospace', fontSize: 13 } }}
          />
        )}
      />
      {exampleChips.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.25 }} flexWrap="wrap" useFlexGap alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Try:
          </Typography>
          {exampleChips.map((e) => (
            <Chip
              key={e.id}
              size="small"
              label={e.label}
              title={e.hint ? `${e.hint}\n${e.id}` : e.id}
              onClick={() => {
                onChange(e.id);
                onSubmit && onSubmit(e.id);
              }}
              variant={value === e.id ? 'filled' : 'outlined'}
              color={value === e.id ? 'primary' : 'default'}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
