import { Collection, TransactionalConnection, LocaleString, LanguageCode, RequestContext } from '@vendure/core';

// Define DropdownOption type
interface DropdownOption {
    value: string;
    label: { languageCode: LanguageCode; value: string }[];
}

export async function getCategoriesDropdownOptions(
    connection: TransactionalConnection
): Promise<DropdownOption[]> {
    // Fetch categories from your database or wherever they are stored
    const categories: Collection[] = await connection.getRepository(Collection).find({
        relations: ['collection']
    });

    // Format the categories into dropdown options
    const options = categories.map((category) => ({
        value: category.id.toString(),
        label: [{ languageCode: LanguageCode.en, value: category.translations[0].name }]
    }));

    return options;
}

export const productFields = [
  {
    name: 'Category',
    type: 'string',
    list: true,
    options: async (ctx: RequestContext): Promise<DropdownOption[]> => {
      const connection = [] as unknown as TransactionalConnection;
      const categories = await getCategoriesDropdownOptions(connection);
      return categories;
    }
  },
  {
    name: 'Subcategory',
    type: 'string',
    list: true,
    options: async (ctx: RequestContext): Promise<DropdownOption[]> => {
        const connection = [] as unknown as TransactionalConnection;
        const subcategories = await getCategoriesDropdownOptions(connection);
      return subcategories;
    }
  }
];
