'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addWork(formData: FormData) {
  const youtubeId = formData.get('youtubeId') as string;
  const title = formData.get('title') as string;
  const clientName = formData.get('clientName') as string;
  const role = formData.get('role') as string;
  const category = formData.get('category') as string;
  const sortOrder = parseInt(formData.get('sortOrder') as string || '999', 10);

  if (youtubeId && title && category) {
    await prisma.portfolio.create({
      data: { youtubeId, title, clientName, role, category, sortOrder }
    });
    revalidatePath('/admin/works');
    revalidatePath('/');
    revalidatePath('/works');
  }
}

export async function deleteWork(formData: FormData) {
  const id = formData.get('id') as string;
  if (id) {
    await prisma.portfolio.delete({ where: { id } });
    revalidatePath('/admin/works');
    revalidatePath('/');
    revalidatePath('/works');
  }
}

export async function updateSortOrder(formData: FormData) {
  const id = formData.get('id') as string;
  const sortOrder = parseInt(formData.get('sortOrder') as string, 10);

  if (id && !isNaN(sortOrder)) {
    await prisma.portfolio.update({
      where: { id },
      data: { sortOrder }
    });
    revalidatePath('/admin/works');
    revalidatePath('/');
    revalidatePath('/works');
  }
}
