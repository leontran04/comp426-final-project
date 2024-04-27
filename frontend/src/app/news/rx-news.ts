import { RxObject } from '../rx-object';
import { News } from './news.model';

export class RxNews extends RxObject<News[]> {
  pushNews(news: News): void {
    this.value.push(news);
    this.notify();
  }

  updateNews(news: News): void {
    this.value = this.value.map((o) => {
      return o.id !== news.id ? o : news;
    });
    this.notify();
  }

  removeNews(newsToRemove: News): void {
    this.value = this.value.filter((news) => newsToRemove.slug !== news.slug);
    this.notify();
  }
}
