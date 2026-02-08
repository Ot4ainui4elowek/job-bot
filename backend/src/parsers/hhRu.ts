/**
 * Парсер для HeadHunter API
 * Источник для работы за границей
 */

import axios, { AxiosInstance } from 'axios';
import {
  HHSearchParams,
  HHVacancy,
  HHVacancyResponse,
} from '../types/types.js';
import {
  Parser,
  ParserConfig,
  ParseResult,
  Vacancy,
} from '../types/vacancy.js';
import { log } from '../utils/helpers.js';

type ParserOptions = {
  apiUrl?: string;
};

export class HHRuParser implements Parser {
  private axiosInstance: AxiosInstance;
  private readonly baseUrl: string;

  constructor(opts?: ParserOptions) {
    this.baseUrl = opts?.apiUrl || 'https://api.hh.ru';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        // Обязательный заголовок согласно документации
        'User-Agent': 'JobSearchParser/1.0 (karam.alesha@mail.ru)',
        Accept: 'application/json',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 10000,
    });
  }

  async parse(config: ParserConfig): Promise<ParseResult> {
    try {
      log(
        `🔍 Начинаю поиск на HH.ru: ${config.searchQuery || 'все вакансии'}\n`,
      );

      const params: HHSearchParams = {
        text: config.searchQuery,
        per_page: 20, // Максимум 20 за запрос
        page: 0,
        // HH требует эти параметры для корректной работы
        only_with_salary: false,
        // Ищем везде по умолчанию (можно потом добавить фильтр по странам)
      };

      const allVacancies: Vacancy[] = [];
      const maxPages = config.maxPages || 5;

      for (let page = 0; page < maxPages; page++) {
        params.page = page;

        log(`📄 Загрузка страницы ${page + 1}/${maxPages}...`);

        const response = await this.fetchVacancies(params);

        if (!response.items || response.items.length === 0) {
          log(`   ⚠️  Страница ${page + 1} пуста`);
          break;
        }

        const vacancies = response.items.map((item) => this.mapHHVacancy(item));
        allVacancies.push(...vacancies);

        log(`   ✅ Получено: ${response.items.length} вакансий`);
        log(`   📊 Всего: ${allVacancies.length} из ${response.found}`);

        // Если достигли конца
        if (page >= response.pages - 1) {
          log(`   ⛔ Достигнута последняя страница`);
          break;
        }

        // Задержка между запросами
        if (page < maxPages - 1 && config.delay) {
          await new Promise((resolve) => setTimeout(resolve, config.delay));
        }
      }

      log(`\n${'='.repeat(60)}`);
      log(`📊 ИТОГО: Найдено ${allVacancies.length} вакансий`);
      log('='.repeat(60));

      return {
        vacancies: allVacancies,
        totalFound: allVacancies.length,
        page: 1,
        hasNextPage: false,
      };
    } catch (error: unknown) {
      log('❌ Ошибка при парсинге HH.ru:', error);
      throw error;
    }
  }

  /**
   * Маппинг вакансии HH в наш формат
   */
  private mapHHVacancy(item: HHVacancy): Vacancy {
    // Собираем описание из snippet
    const descriptionParts: string[] = [];
    if (item.snippet.requirement) {
      descriptionParts.push(`Требования: ${item.snippet.requirement}`);
    }
    if (item.snippet.responsibility) {
      descriptionParts.push(`Обязанности: ${item.snippet.responsibility}`);
    }

    // Зарплата в формате строки
    let salary: string | undefined;
    if (item.salary) {
      const { from, to, currency } = item.salary;
      if (from && to) {
        salary = `${from} - ${to} ${currency}`;
      } else if (from) {
        salary = `от ${from} ${currency}`;
      } else if (to) {
        salary = `до ${to} ${currency}`;
      }
    }

    // Извлекаем навыки из professional_roles
    const skills = item.professional_roles?.map((role) => role.name) || [];

    return {
      id: item.id,
      title: item.name,
      company: item.employer.name,
      salary,
      location: item.area.name,
      description: descriptionParts.join('\n') || undefined,
      url: item.alternate_url,
      publishedAt: new Date(item.published_at),
      experience: item.experience?.name,
      schedule: item.work_format[0].id,
      skills,
      employmentType: item.employment?.name,
      source: 'hh.ru',
    };
  }

  /**
   * Запрос к API HH
   */
  private async fetchVacancies(
    params: HHSearchParams,
  ): Promise<HHVacancyResponse> {
    try {
      // Логируем точный запрос для отладки
      const queryParams = new URLSearchParams(
        params as Record<string, string>,
      ).toString();
      log(`   🌐 Запрос: ${this.baseUrl}/vacancies?${queryParams}`);

      const response = await this.axiosInstance.get<HHVacancyResponse>(
        '/vacancies',
        {
          params,
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        log(`❌ Ошибка HTTP: ${error.message}`);

        // Логируем детали ошибки
        if (error.response) {
          log(`   Статус: ${error.response.status}`);
          log(`   Данные ошибки:`, error.response.data);
        }

        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Попробуйте позже.');
        }
        if (error.response?.status === 400) {
          throw new Error(
            `Некорректные параметры запроса: ${JSON.stringify(error.response.data)}`,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Детальная информация о вакансии (не используется, так как HH уже дает полные данные)
   */
  async parseVacancyDetails(_url: string): Promise<Partial<Vacancy>> {
    console.log(_url);
    // HH API уже возвращает достаточно данных в списке
    // Детальный запрос не требуется для базовой интеграции
    return {};
  }
}
