# Mapa aplikacji delivery

Strona Hugo: `/mapa-delivery/`. Jest też dostępna w nawigacji „Aplikacje kurierskie”.
Mapa działa bez zewnętrznego API, kluczy, CDN i opłat za kafelki. Baza oraz kontury geograficzne są częścią projektu.

## Aktualizacja bez edytowania kodu

**Edytor działa tylko lokalnie.** Przycisk **Edytuj bazę**, kopie robocze, import i eksport JSON oraz CSV istnieją wyłącznie w środowisku `development`, czyli po uruchomieniu `hugo server`. Build produkcyjny ich nie zawiera, także w kodzie JS, a mapa czyta wtedy tylko `static/data/delivery-map.json`.

1. Uruchom `hugo server`, otwórz mapę i kliknij **Edytuj bazę**.
2. Wybierz miejscowość albo **Nowa miejscowość**. Wpisz nazwę, województwo i współrzędne (szerokość, potem długość).
3. Przy aplikacji wybierz status i „Co potwierdza źródło”, podaj publiczny link potwierdzający zmianę, opis odnośnika, miejsce wskazujące miasto w źródle oraz datę faktycznego sprawdzenia. Nie zmieniaj dat innych aplikacji, których nie sprawdzono ponownie.
4. Kliknij **Zapisz kopię roboczą**. Podgląd od razu korzysta ze zmian. Kopia zostaje w pamięci tej przeglądarki; nie zmienia strony innym osobom.
5. Kliknij **Pobierz bazę JSON**. Zastąp pobranym plikiem `static/data/delivery-map.json` w tym projekcie.
6. Uruchom sprawdzenie `node --test tests/delivery-map.test.mjs`, zbuduj Hugo i opublikuj stronę zwykłym sposobem.

**Wczytaj JSON** pozwala kontynuować pracę na innym urządzeniu. Import odrzuca błędny schemat, duplikaty, nieprawidłowe daty, współrzędne poza zakresem Polski i niebezpieczne adresy URL. Nie sprawdza prawdziwości treści źródła ani zgodności współrzędnych z nazwą — to zadanie redakcji. Lokalna kopia nie synchronizuje się pomiędzy urządzeniami i może zniknąć po wyczyszczeniu danych przeglądarki, dlatego po zmianach pobieraj JSON.

**Przywróć bazę strony** wymaga dwóch kliknięć. Przed przywróceniem zapisana lokalna kopia jest pobierana jako zapasowy JSON. Import także pobiera poprzednią kopię roboczą przed zastąpieniem. Eksport CSV w edytorze służy przeglądaniu zestawienia; import obsługuje JSON.

## Co mapa potwierdza

Mapa służy kurierom platformowym. **Możliwość zamówienia jedzenia w mieście nie dowodzi, że kurierzy platformy mogą tam otrzymywać zlecenia.** Restauracja może korzystać z własnych pracowników. Nie przypisujemy jednak takiego modelu konkretnemu miastu bez dowodu — brak potwierdzenia oznaczamy jako niepewność.

Każdy rekord ma pole `evidenceScope`, edytowalne jako „Co potwierdza źródło”:

- `platform_couriers` — konkretne źródło wiąże miejscowość ze zleceniami dla kurierów platformy: strefa w aplikacji kurierskiej, centrum kurierów, komunikat o uruchomieniu lub źródło partnera wyraźnie wskazujące model dostawy.
- `courier_form` — miasto widoczne w formularzu dla kurierów. To sygnał rejestracji, bez gwarancji działania strefy lub aktualnie otwartego naboru.
- `customer_catalog` — tylko katalog przeznaczony dla zamawiających; niewystarczający do potwierdzenia pracy kurierów.
- `unknown` — model dostaw nie został potwierdzony.

Liczniki, filtry i kolory uwzględniają `active` wyłącznie razem z `platform_couriers`. Formularze `recruiting` + `courier_form` są domyślnie wyłączone; można je włączyć osobnym filtrem. Stare kopie JSON bez `evidenceScope` można odczytać, ale ich wpisy nie są liczone jako potwierdzone. Edytor wymaga zgodności zakresu źródła ze statusem przed zapisem. Eksport CSV podaje skuteczny status oraz zakres potwierdzenia.

Pełny audyt tego kryterium znajduje się w `data/delivery-map-courier-audit.json`. Raporty `delivery-map-uber-courier-audit.json` i `delivery-map-platform-courier-audit.json` zachowują szczegóły sprawdzonych źródeł. Wcześniejszy audyt odnośników jest archiwum pierwszej korekty, nie dowodem modelu pracy kurierów.

Pierwsza aktualizacja z 5.11.2026 dotyczyła tylko Glovo i jest już nieaktualna. Niepubliczna tabela miast przekazana redakcji podniosła 129 miejscowości do `active`, a Gdynia i Sopot doszły jako część pozycji Trójmiasto. 6 miast (Brzeg, Cieszyn, Kielce, Nowa Sól, Nowy Targ, Żagań) uznano decyzją redakcji na podstawie formularza i listy z `8-glovo-new.md`. Ta lista pokrywa się z katalogiem klienta, więc sama nie wystarcza: 18 wpisów tylko z katalogu pozostaje `unverified`. Szczegóły są w `data/delivery-map-glovo-table-audit.json`, a kopia bazy sprzed zmiany w `reports/delivery-map-audit/delivery-map-before-glovo-table-audit.json`.

**Od 5.11.2026 mapa pokrywa się dokładnie z tabelką** `reports/delivery-map-sources/Miasta_aplikacje_kurierzy_flotowi.xlsx` (flota Eternis, plik z 4.11.2026). Decyzją właściciela serwisu jest ona jedynym źródłem zasięgu: każdy plus to wpis `active`, a wpisów bez plusa nie ma. Artykuł z jej kopią (`miasta-aplikacji.md`) usunięto ze strony, bo zastępuje go ta mapa. Jego kopia jest w `reports/delivery-map-audit/miasta-aplikacji-usuniety-artykul.md`, a pole `source` w bazie wskazuje teraz na samą mapę. Usunięto 178 wpisów bez plusa, w tym 8 potwierdzonych wcześniej publicznym źródłem, oraz 89 miejscowości bez żadnego wpisu. Mapa nie pokazuje przy aplikacjach opisów ani odnośników do źródeł, a CSV zawiera tylko miejscowość, aplikację i status. Pola `source` i `checkedAt` zostały w bazie, bo wymaga ich walidacja, ale nigdzie nie są wyświetlane. 121 wcześniejszych odnośników (m.in. MB Partner, Flow Apps, Biedronka, BIEK, strony Wolta i Stuarta) zachowano tylko w `data/delivery-map-single-source-audit.json`. Doszła aplikacja Jush oraz 4 nowe punkty: Chyliczki, Józefosław, Pułtusk i Sierpc. Piątkowo jest osiedlem Poznania i nie ma osobnego punktu. Szczegóły są w `data/delivery-map-fleet-table-audit.json` i `data/delivery-map-fleet-mirror-audit.json`. Kopie bazy z kolejnych etapów: `reports/delivery-map-audit/delivery-map-before-fleet-table.json`, `delivery-map-before-fleet-mirror.json`, `delivery-map-before-single-source.json` i `delivery-map-before-no-descriptions.json`. Filtr i legenda formularzy pojawiają się tylko wtedy, gdy baza ma wpisy `recruiting`.

Stan z 5.11.2026: **472 wpisy w 193 miejscowościach**.

| Aplikacja | Kurierzy platformowi | Formularz kurierski | Zapowiedź | Do weryfikacji |
| --- | ---: | ---: | ---: | ---: |
| Glovo | 182 | 0 | 0 | 0 |
| Uber Eats | 129 | 0 | 0 | 0 |
| Wolt | 23 | 0 | 0 | 0 |
| Bolt Food | 15 | 0 | 0 | 0 |
| Stuart | 24 | 0 | 0 | 0 |
| Pyszne.pl | 94 | 0 | 0 | 0 |
| Jush | 5 | 0 | 0 | 0 |
| Razem | 472 | 0 | 0 | 0 |

Mapa pokazuje wszystkie 193 miejscowości z bazy.

## Znaczenie statusów

- `active` — miejscowość z potwierdzeniem zleceń dla kurierów platformowych (`evidenceScope: platform_couriers`). Nie jest to test zamówienia ani dowód granic strefy czy otwartej rekrutacji.
- `recruiting` — miasto widoczne w formularzu kurierskim. Osobny filtr i oznaczenie; nie wlicza się do liczby potwierdzonych aplikacji w mieście. Nie gwarantuje otwartego naboru.
- `announced` — zapowiedź, jeszcze niewliczana do dostępności.
- `unverified` — wpis wymagający ponownej weryfikacji, niewliczany do dostępności.
- `inactive` — potwierdzone wycofanie, niewliczane do dostępności. Zachowaj link potwierdzający wycofanie.
- „Brak wpisu” usuwa rekord aplikacji z miejscowości. Oznacza brak danych, nie brak działania aplikacji.

Punkt wyświetla się, jeśli ma co najmniej jedną aplikację `active` lub (przy włączonym filtrze) `recruiting`. Każda aplikacja ma własny kolor (pole `color` w `apps`), a punkt dzieli się na tyle równych wycinków, ile aplikacji ma miejscowość. Im więcej aplikacji, tym większy punkt. Paleta jest dobrana pod ciemne tło mapy i sprawdzona pod kątem daltonizmu, więc nie są to dokładne kolory marek. Kolejność wycinków ustala `SLICE_ORDER` w `delivery-map.js`. Przerywana pomarańczowa obwódka oznacza formularz kurierski. Wybór filtrów ogranicza miejscowości, a panel miasta pokazuje wszystkie wpisy, także zapowiedzi i wycofania. Nazwy można wyszukiwać bez polskich znaków. Kliknięcie wyniku przybliża mapę; przyciskiem celownika wraca się do całej Polski.

## Archiwalny audyt odnośników — przed rozdzieleniem modelu dostaw

**Uwaga: poniższe liczby dotyczą wcześniejszego audytu samych odnośników. Katalogi klientów nie są już podstawą liczenia pracy kurierów. Aktualny stan opisuje audyt modelu dostaw wskazany wyżej.**

Sprawdzono wszystkie **562 wpisy aplikacja–miejscowość w 277 miejscowościach**. Po korekcie jest 422 wpisów potwierdzonych w źródłach, 94 z formularza kurierskiego i 46 wymagających weryfikacji. Zmieniono 69 adresów źródeł, w tym odsyłacze do konkretnych sekcji. Dane pozostają edytowalne; jest to stan audytu, nie limit przyszłej ekspansji.

| Aplikacja | Wynik sprawdzenia |
| --- | --- |
| Glovo | 167 wpisów. Sprawdzono katalog i strony miejscowości. Naprawiono 3 błędy 404: Gdańsk → `trojmiasto`, Kiełczów → `kielczow-okolice-wroclawia`, Piastów → `okolice-warszawy`. Opisy wyjaśniają nazwy obszarów używane przez operatora. |
| Uber Eats | 203 wpisy potwierdzone katalogiem i działającą stroną miasta. Skarszewy nadal są w katalogu, ale strona miasta zwraca 404: status `unverified`, nie deklaracja wycofania usługi. |
| Wolt | 25 wpisów. 23 strony miast oraz 2 wpisy z FAQ dla kurierów: Katowice i Chorzów. Te dwa źródła wskazują sekcję FAQ i właściwe pytanie do rozwinięcia. |
| Bolt Food | Poprawiono wszystkie 56 źródeł. Dla 10 miast dodatkowym potwierdzeniem jest komunikat Auchan z 13.08.2026, dla Rzeszowa komunikat partnera Natviol z 01.06.2026. Pozostałe 45 ma własne linki miejskie, ale status `unverified`: wspólny szablon marketingowy nie wystarcza do potwierdzenia dostaw. |
| Stuart | 16 miejscowości: 9 z sekcji „Operujemy” oraz 7 z artykułu „Nowe strefy!”. Rozszerzenia mają odsyłacze do właściwych nagłówków. |
| Pyszne.pl | 94 miejscowości z 93 widocznych opcji formularza (Rumia & Reda rozdzielone). Wtedy wyłącznie status `recruiting`, bez gwarancji otwartego naboru. |

Po tej korekcie Ciechanów nie odsyłał już do Poznania. Bolt Food w Ciechanowie ma status „Do weryfikacji” i nie jest wliczany do dostępności. Brak mocnego potwierdzenia **nie oznacza**, że usługa nie działa. Skarszewy, mające tylko niepotwierdzony wpis Uber Eats, pozostają w bazie i edytorze, ale nie są punktem na mapie dostępności; dlatego poprzednia wersja mapy pokazywała 276 z 277 zapisanych miejscowości. Po weryfikacji modelu dostaw liczba punktów jest inna.

Źródła zestawień: [Glovo](https://glovoapp.com/pl/pl/map/cities), [Uber Eats](https://www.ubereats.com/pl/location), [Wolt](https://wolt.com/pl/pol), [FAQ Wolt](https://explore.wolt.com/en/pol/couriers/learning-center#2pfXg1b40CLtcNMpCZj6bR), [Auchan / Bolt Food](https://media.auchan.pl/komunikaty-prasowe/sklepy-auchan-dostepne-w-aplikacji-bolt-food), [Natviol / Rzeszów](https://natviol.com/bolt-food-w-rzeszowie-z-natviol-zacznij-dostawy-i-odbierz-bonus-100-zl/), [Stuart](https://stuart.com/pl/o-nas/), [nowe strefy Stuart](https://help.stuart.com/pl/articles/11737380-nowe-strefy), [formularz Pyszne.pl](https://www.pyszne.pl/kurier/form).

To katalog potwierdzeń w źródłach, nie test zamówień pod konkretnym adresem ani pomiar usług na żywo. Data odczytu źródła nie jest datą startu usługi. Brak miasta lub aplikacji nie oznacza braku usługi. Baza nie aktualizuje się automatycznie.

Pełny ślad audytu jest w `data/delivery-map-source-audit.json`: poprzedni i nowy wpis, rodzaj dowodu i wskazanie treści potwierdzającej miasto. Raporty szczegółowe to `delivery-map-catalog-audit.json`, `delivery-map-bolt-audit.json` i `delivery-map-shared-audit.json` w katalogu `data/`. Odczyty HTML, metadane odpowiedzi oraz kopia bazy sprzed korekty są lokalnie w ignorowanym katalogu `reports/delivery-map-audit/`.

`data/delivery-map-research.json` zachowuje historyczne ustalenia pierwszej wersji, **sprzed korekty**; nie jest bazą używaną przez mapę. `data/delivery-map-exclusions.json` zawiera świadomie pominięte pozycje. Nie włączono automatycznie gmin, dzielnic ani niejednoznacznych „okolic” do dostępności całego miasta.

Po zmianie wersji danych stara lokalna kopia robocza wyświetla ostrzeżenie. Otwórz edytor i wybierz **Przywróć bazę strony**, aby obejrzeć poprawione dane; przed zastąpieniem stara kopia zostanie wyeksportowana jako zapasowy JSON. Następnie można przenieść do aktualnej bazy własne zmiany redakcyjne.

## Pliki i budowanie

- `static/data/delivery-map.json` — jedyna baza używana przez stronę i edytor.
- `static/data/poland-map.geojson` — geometria podkładu.
- `layouts/docs/delivery-map.html` — samodzielny układ mapy.
- `assets/docs/js/delivery-map.js` — interakcje i edytor.
- `assets/docs/js/delivery-map-model.mjs` — walidacja, filtrowanie, eksport.
- `assets/docs/css/delivery-map.css` — wygląd i responsywność.
- `assets/docs/scss/kurierska.scss` — wspólne kolory Kurierpedii, używane także przez mapę. Czcionki mapa pobiera z tych samych parametrów Hugo co LotusDocs (`secondary_font`, `sans_serif_font`).
- `assets/images/delivery-apps/` — oryginalne ikony z oficjalnych stron aplikacji. Źródła i sumy kontrolne są w `data/delivery-map-branding.json`. Hugo osadza pomniejszone ikony w stronie, więc także eksport HTML zawiera je lokalnie.

Dodanie kolejnej aplikacji: dodaj element do `apps` w JSON (`id`, `name`, `short`, kolor `#rrggbb`, `source`, `scope`), a następnie rekordy w `cities[].apps`. Filtry i formularze utworzą się automatycznie. Dodaj jej ikonę do `assets/images/delivery-apps/` i wpis do `data/delivery-map-branding.json`; do tego czasu aplikacja używa skrótu jako oznaczenia zastępczego. Nie trzeba przerabiać geometrii mapy.

`scripts/build-delivery-map-data.py` odtwarza **odczyt z 21.10.2026 po audycie**, korzystając z lokalnych plików źródłowych i obowiązkowych korekt z `data/delivery-map-source-audit.json` oraz `data/delivery-map-courier-audit.json`. Przerywa działanie, jeśli lista rekordów lub pierwotne źródła nie zgadzają się z przejrzanym zestawem. Domyślnie zapisuje kandydat do `reports/delivery-map-candidate.json`, nie nadpisuje edytowanej bazy. Nie jest automatycznym odświeżaczem i nie należy używać go do pozornego podbijania dat weryfikacji. Argument `--initial` odmawia zastąpienia istniejącej bazy.

`scripts/audit-delivery-map-sources.py` pobiera katalogi i strony Glovo, Uber Eats oraz Wolt, zachowuje odpowiedzi i tworzy raport kandydatów do ręcznego przeglądu. Nie zmienia bazy. Status HTTP 200 i zgodna nazwa miasta nie są samodzielną gwarancją działania; pozostałe aplikacje i źródła zbiorcze wymagają osobnego sprawdzenia treści.

Przykładowe sprawdzenie lokalne w PowerShell:

```powershell
node --test tests/delivery-map.test.mjs
$env:HUGO_MODULE_PROXY='off'
hugo --noBuildLock --destination reports/delivery-map-build --minify
python -m http.server 8133 --bind 127.0.0.1 --directory reports/delivery-map-build
```

Podgląd: http://127.0.0.1:8133/mapa-delivery/ . Kompilacja i podgląd nie publikują zmian.

Po kompilacji `node scripts/export-delivery-map.mjs` tworzy samodzielny plik `reports/mapa-delivery.html`. Można go otworzyć dwuklikiem bez serwera i internetu. Zawiera mapę i bazę z chwili eksportu, bez edytora. Żeby wyeksportować wersję z edytorem, zbuduj stronę z `--environment development`. Po aktualizacji JSON wygeneruj plik ponownie.

Współrzędne: [GeoNames](https://www.geonames.org/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Granice województw i państw: [Natural Earth](https://www.naturalearthdata.com/), domena publiczna. Podkład został przycięty do okolic Polski. Atrybucja jest również widoczna na mapie.
