'use client';

import { Product, Image, Category, Size, Color } from '@prisma/client';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { AlertModal } from '@/components/modals/alert-modal';
import ImageUpload from '@/components/ui/image-upload';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type ProductFormProps = {
	initialData:
		| (Product & {
				images: Image[];
		  })
		| null;
	categories: Category[];
	size: Size[];
	color: Color[];
};

const formSchema = z.object({
	name: z.string().min(1),
	images: z.object({ url: z.string() }).array(),
	price: z.coerce.number().min(1),
	categoryId: z.string().min(1),
	colorId: z.string().min(1),
	sizeId: z.string().min(1),
	isFeatured: z.boolean().default(false).optional(),
	isArchived: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

export const ProductForm = ({
	initialData,
	categories,
	size,
	color,
}: ProductFormProps) => {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const params = useParams();
	const { storeId, productId } = params;
	const router = useRouter();

	const title = initialData ? 'Edit product' : 'Create product';
	const description = initialData ? 'Edit product' : 'Add a new product';
	const toastMessage = initialData ? 'Product updated' : 'Product created';
	const action = initialData ? 'Save changes' : 'Create';

	const form = useForm<ProductFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: initialData
			? {
					...initialData,
					price: parseFloat(String(initialData?.price)),
			  }
			: {
					name: '',
					images: [],
					price: 0,
					categoryId: '',
					colorId: '',
					sizeId: '',
					isFeatured: false,
					isArchived: false,
			  },
	});

	const onSubmit = async (data: ProductFormValues) => {
		try {
			setLoading(true);
			if (initialData) {
				await axios.patch(`/api/${storeId}/products/${productId}`, data);
			} else {
				await axios.post(`/api/${storeId}/products`, data);
			}
			router.refresh();
			router.push(`/${storeId}/products`);
			toast.success(toastMessage);
		} catch (error) {
			toast.error('Something went wrong');
		} finally {
			setLoading(false);
		}
	};

	const onDelete = async () => {
		try {
			setLoading(true);
			await axios.delete(`/api/${storeId}/products/${productId}`);
			router.refresh();
			router.push(`/${storeId}/products`);
			toast.success('Product deleted');
		} catch (error) {
			toast.error(
				'Something went wrong'
				);
		} finally {
			setLoading(false);
			setOpen(false);
		}
	};

	return (
		<>
			<AlertModal
				isOpen={open}
				onClose={() => setOpen(false)}
				onConfirm={onDelete}
				loading={loading}
			/>
			<div className="flex items-center justify-between">
				<Heading title={title} description={description} />
				{initialData && (
					<Button
						disabled={loading}
						variant="destructive"
						size="sm"
						onClick={() => setOpen(true)}
					>
						<Trash className="h-4 w-4" />
					</Button>
				)}
			</div>
			<Separator />
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8 w-full"
				>
					<FormField
						control={form.control}
						name="images"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Images</FormLabel>
								<FormControl>
									<ImageUpload
										value={field.value.map(image => image.url)}
										disabled={loading}
										onChange={url => field.onChange([...field.value, { url }])}
										onRemove={url =>
											field.onChange([
												...field.value.filter(current => current.url !== url),
											])
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="grid grid-cols-3 gap-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											disabled={loading}
											placeholder="Product name"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="price"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Price</FormLabel>
									<FormControl>
										<Input
											disabled={loading}
											placeholder="9.99"
											{...field}
											type="number"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="categoryId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category</FormLabel>
									<Select
										disabled={loading}
										onValueChange={field.onChange}
										value={field.value}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													defaultValue={field.value}
													placeholder="Select a category"
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{categories.map(({ id, name }) => (
												<SelectItem value={id} key={id}>
													{name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="sizeId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Sizes</FormLabel>
									<Select
										disabled={loading}
										onValueChange={field.onChange}
										value={field.value}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													defaultValue={field.value}
													placeholder="Select a size"
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{size.map(({ id, name }) => (
												<SelectItem value={id} key={id}>
													{name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="colorId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Color</FormLabel>
									<Select
										disabled={loading}
										onValueChange={field.onChange}
										value={field.value}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													defaultValue={field.value}
													placeholder="Select a color"
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{color.map(({ id, name }) => (
												<SelectItem value={id} key={id}>
													{name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="isFeatured"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Featured</FormLabel>
										<FormDescription>
											Featured products will appear on the home page{' '}
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="isArchived"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Archived</FormLabel>
										<FormDescription>
											Archived products will not appear in the store{' '}
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>
					</div>
					<Button disabled={loading} className="ml-auto" type="submit">
						{action}
					</Button>
				</form>
			</Form>
			<Separator />
		</>
	);
};
