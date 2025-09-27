'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { timesheetApi } from '@/lib/api'; // Adjust this path based on your project
import { dateUtils } from '@/lib/api'; // Adjust this path based on your project

const schema = z.object({
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), 'Invalid date')
});

type Form = z.infer<typeof schema>;

export default function TimesheetCreateModal({
  onClose,
  onSuccess
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { register, handleSubmit, formState, watch } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10)
    }
  });

  const submit = async (data: Form) => {
    try {
      const selectedDate = new Date(data.date);
      const weekNumber = dateUtils.getWeekNumber(selectedDate);
      const year = selectedDate.getFullYear();
      const { start, end } = dateUtils.getWeekRange(year, weekNumber);

      await timesheetApi.createTimesheet({
        weekNumber,
        year,
        weekStartDate: start,
        weekEndDate: end
      });

      toast.success('Timesheet created successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Error creating timesheet');
    }
  };

  const currentDate = watch('date');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Timesheet</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Week Start Date</label>
            <input
              {...register('date')}
              type="date"
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Selected Week:</span>{' '}
              {(() => {
                try {
                  const date = new Date(currentDate);
                  const week = dateUtils.getWeekNumber(date);
                  const year = date.getFullYear();
                  const { start, end } = dateUtils.getWeekRange(year, week);
                  return `Week ${week} (${start} - ${end})`;
                } catch {
                  return 'Invalid date';
                }
              })()}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formState.isSubmitting}
              className={`
                'px-4 py-2 bg-indigo-600 text-white rounded w-full sm:w-auto',
                ${formState.isSubmitting && 'opacity-50 cursor-not-allowed'}
              `}
            >
              {formState.isSubmitting ? 'Saving...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
