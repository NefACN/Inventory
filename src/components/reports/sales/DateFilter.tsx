import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';
import { styled } from '@mui/material/styles';

interface DateFilterProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
}

const FilterContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
    },
}));

export default function DateFilter({ startDate, endDate, onStartDateChange, onEndDateChange }: DateFilterProps) {
    const handleStartDateChange = (date: Date | null) => {
        if (date) {
            const selectedDate = date.toISOString().split('T')[0];
            if (new Date(selectedDate) <= new Date(endDate)) {
                onStartDateChange(selectedDate);
            } else {
                alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
            }
        }
    };

    const handleEndDateChange = (date: Date | null) => {
        if (date) {
            const selectedDate = date.toISOString().split('T')[0];
            if (new Date(selectedDate) >= new Date(startDate)) {
                onEndDateChange(selectedDate);
            } else {
                alert('La fecha de fin no puede ser menor que la fecha de inicio.');
            }
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <FilterContainer>
                <DatePicker
                    label="Fecha de inicio"
                    value={new Date(startDate)}
                    onChange={handleStartDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                    label="Fecha de fin"
                    value={new Date(endDate)}
                    onChange={handleEndDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                />
            </FilterContainer>
        </LocalizationProvider>
    );
}
