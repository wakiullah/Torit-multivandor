'use client'
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function EditProductModal({ showModal, onClose, product, onUpdateSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        mrp: '',
        variations: [],
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                mrp: product.mrp || '',
                variations: product.variations || [],
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVariationChange = (index, field, value) => {
        const newVariations = [...formData.variations];
        if (field.startsWith('attribute.')) {
            const attrIndex = parseInt(field.split('.')[2], 10);
            const attrField = field.split('.')[1];
            newVariations[index].attributes[attrIndex][attrField] = value;
        } else {
            newVariations[index][field] = value;
        }
        setFormData(prev => ({ ...prev, variations: newVariations }));
    };

    const addVariation = () => {
        setFormData(prev => ({
            ...prev,
            variations: [...prev.variations, { attributes: [{ name: '', value: '' }], price: '' }]
        }));
    };

    const removeVariation = (index) => {
        const newVariations = [...formData.variations];
        newVariations.splice(index, 1);
        setFormData(prev => ({ ...prev, variations: newVariations }));
    };

    const addAttribute = (variationIndex) => {
        const newVariations = [...formData.variations];
        newVariations[variationIndex].attributes.push({ name: '', value: '' });
        setFormData(prev => ({ ...prev, variations: newVariations }));
    };

    const removeAttribute = (variationIndex, attributeIndex) => {
        const newVariations = [...formData.variations];
        newVariations[variationIndex].attributes.splice(attributeIndex, 1);
        setFormData(prev => ({ ...prev, variations: newVariations }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/products/${product._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Product updated successfully!');
                onUpdateSuccess();
                onClose();
            } else {
                toast.error(data.message || 'Failed to update product.');
            }
        } catch (error) {
            toast.error('An error occurred while updating product.');
            console.error('Update product error:', error);
        }
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl h-3/4 overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        ></textarea>
                    </div>

                    {product.variations && product.variations.length > 0 ? (
                        <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Variations</h3>
                            {formData.variations.map((variation, vIndex) => (
                                <div key={vIndex} className="p-3 border rounded-md mb-3">
                                    <div className='flex justify-between'>
                                        <h4 className="text-md font-semibold mb-2">Variation #{vIndex + 1}</h4>
                                        <button type="button" onClick={() => removeVariation(vIndex)} className="text-red-500 hover:text-red-700">Remove</button>
                                    </div>
                                    <div className="mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Price</label>
                                        <input
                                            type="number"
                                            value={variation.price}
                                            onChange={(e) => handleVariationChange(vIndex, 'price', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            required
                                        />
                                    </div>
                                    {variation.attributes.map((attr, aIndex) => (
                                        <div key={aIndex} className="flex items-center gap-2 mb-2">
                                            <input
                                                type="text"
                                                placeholder="Attribute Name"
                                                value={attr.name}
                                                onChange={(e) => handleVariationChange(vIndex, `attribute.name.${aIndex}`, e.target.value)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Attribute Value"
                                                value={attr.value}
                                                onChange={(e) => handleVariationChange(vIndex, `attribute.value.${aIndex}`, e.target.value)}
                                                className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                            <button type="button" onClick={() => removeAttribute(vIndex, aIndex)} className="text-red-500">-</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addAttribute(vIndex)} className="text-sm text-blue-500 hover:text-blue-700">+ Add Attribute</button>
                                </div>
                            ))}
                            <button type="button" onClick={addVariation} className="text-sm text-blue-500 hover:text-blue-700">+ Add Variation</button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="mrp" className="block text-sm font-medium text-gray-700">MRP</label>
                                <input
                                    type="number"
                                    id="mrp"
                                    name="mrp"
                                    value={formData.mrp}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
