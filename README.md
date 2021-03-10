# Gulp/Webpack starter template

За основу взят проект - https://github.com/agragregra/OptimizedHTML-5

Все задачи выполняются через Gulp. Webpack используется только для сборки Javascript.

## Клонирование

Скачайте файлы с github или клонируйте его c помощью команды:

```bash
git clone https://github.com/svoosh/gulp-webpack-app.git
rm -rf trunk .gitignore readme.md .git dist .travis.yml
```

## Установки зависимостей проекта

Для установки зависимостей проекта необходимо в командной строке ввести команды:

```yarn
yarn
```

## Изменения

1. Убраны препроцессоры stylus/less, в качестве осовного исползуется scss
2. Добавлен hash_src, добавляющий хэш-значение в конец подключаемых css/js файлов (выполняется по команде gulp build)
3. Настройка плагина imagemin
4. Новая структура папки scss: миксины и var вынесены в отдельную папку, папка containers предназначена для стилей отедльных блоков
