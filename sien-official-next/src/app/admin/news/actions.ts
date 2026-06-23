'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createNews(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const slug = formData.get('slug') as string || `news-${Math.random().toString(36).substring(2, 10)}`;
  const dateStr = formData.get('date') as string;
  const isVisible = formData.get('isVisible') === 'true';

  await prisma.news.create({
    data: {
      title,
      content,
      slug,
      date: dateStr ? new Date(dateStr) : new Date(),
      isVisible
    }
  });
  revalidatePath('/admin/news');
  revalidatePath('/news');
  revalidatePath('/');
}

export async function updateNews(formData: FormData) {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const slug = formData.get('slug') as string;
  const dateStr = formData.get('date') as string;
  const isVisible = formData.get('isVisible') === 'true';

  await prisma.news.update({
    where: { id },
    data: {
      title,
      content,
      slug: slug || undefined, // undefined prevents setting empty string if not provided
      date: dateStr ? new Date(dateStr) : new Date(),
      isVisible
    }
  });
  revalidatePath('/admin/news');
  revalidatePath('/news');
  revalidatePath('/');
}

export async function deleteNews(formData: FormData) {
  const id = formData.get('id') as string;
  await prisma.news.delete({ where: { id } });
  revalidatePath('/admin/news');
  revalidatePath('/news');
  revalidatePath('/');
}
