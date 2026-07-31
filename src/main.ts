import { Filters } from './Filters';
import './filters.scss';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Filters app root was not found');

new Filters({ container: root });
