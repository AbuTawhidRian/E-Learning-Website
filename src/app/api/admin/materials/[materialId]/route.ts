import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: Promise<{ materialId: string }> }) {
  const resolvedParams = await params;
  const user = await getAuthUser();
  
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.material.delete({
      where: { id: resolvedParams.materialId }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
  }
}
