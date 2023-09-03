import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(
	req: Request,
	{ params }: { params: { storeId: string } }
) {
	try {
		const { userId } = auth();
		const body = await req.json();

		const { name, colorValue } = body;
		const { storeId } = params;


		if (!userId) return new NextResponse('Unauthenticated', { status: 401 });

		if (!name) return new NextResponse('Name is required', { status: 400 });
		if (!colorValue) return new NextResponse('Color value is required', { status: 400 });

		if (!storeId)
			return new NextResponse('Color id is required', { status: 400 });

		const storeByUserId = await prismadb.store.findFirst({
			where: { id: storeId, userId },
		});

		if (!storeByUserId)
			return new NextResponse('Unauthorized', { status: 403 });

		const color = await prismadb.color.create({
			data: {
				name,
				colorValue,
				storeId,
			},
		});

		return NextResponse.json(color);
	} catch (error) {
		console.log('[COLOR_POST]', error);
		return new NextResponse('Internal error', { status: 500 });
	}
}

export async function GET(
	req: Request,
	{ params }: { params: { storeId: string } }
) {
	try {
		const { storeId } = params;

		if (!storeId)
			return new NextResponse('Store id is required', { status: 400 });

		const color = await prismadb.color.findMany({
			where: { storeId },
		});

		return NextResponse.json(color);
	} catch (error) {
		console.log('[COLOR_GET]', error);
		return new NextResponse('Internal error', { status: 500 });
	}
}
