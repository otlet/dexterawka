---
weight: 8
title: "Aplikacja Uber Eats"
description: "Specyfikacja aplikacji Uber Eats"
icon: "article"
date: "2024-04-26T13:08:32+02:00"
lastmod: "2026-08-28T13:08:32+02:00"
draft: false
toc: true
---

<div style="text-align:center">

![](/images/uber.png)

# Informacje ogólne o aplikacji

</div>

Aplikacja UBER EATS ma dwie wersje: dla klientów i dla kurierów. Klienci mogą wybierać spośród różnych opcji gastronomicznych, płacić za zamówienia online i śledzić status dostawy na mapie. Aplikacja dla kurierów ma nazwe Uber Driver i jest do pobrania na urządzenia [Android](https://play.google.com/store/apps/details?id=com.ubercab.driver&hl=pl&gl=US) oraz [iOS](https://apps.apple.com/pl/app/uber-driver-drive-deliver/id1131342792). Aplikacja dla klientów od jakiegoś czasu oferuje usługi wysyłki paczek.

{{<alert context="info" text="Aplikacja **[Uber Driver](https://play.google.com/store/apps/details?id=com.ubercab.driver)** jest używana zarówno do usług dostaw jedzenia jak i taxi, nie ma osobnych aplikacji."/>}}

### [FAQ - Uber Eats](https://www.uber.com/pl/pl/deliver/basics/)

<div style="text-align:center">

## Plusy i minusy aplikacji

</div>

{{% alert icon="🟢"context="success" %}}

### Plusy:
* Pracujesz kiedy chcesz i jak chcesz (offslot)
* Dowolność w przyjmowaniu zamówień
* Bardzo wysokie stawki w złą pogodę i w dużym zapotrzebowaniu (nawet 120zł za podwójne/potrójne zamówienie)
* Questy
* Częste i wysokie napiwki
* Widać miejsce dostawy przed akceptacją zamówienia oraz kwotę za jaką pojedziemy
* Wypłaty w zaliczkach gotówkowych
  
{{% /alert %}}

{{% alert icon="🔴"context="danger" %}}

### Minusy:
* Dynamiczne stawki (w zależności od zapotrzebowania, ten sam kurs może być raz gorzej, a raz lepiej płatny)
* Brak ciągłości zamówień dla kurierów rowerowych
* Kompletny brak supportu
  
{{% /alert %}}

{{<alert context="info" text="Uber Eats wyświetla w **PODSUMOWANIU** zarobki w kwotach **BRUTTO** - należy zarobioną kwotę podzielić przez 1.23 aby uzyskać kwotę netto. Kwota netto jest wyświetlana tylko w momencie akceptowania zamówienia!"/>}}

<div style="text-align:center">

## Prezentacja aplikacji


![](/images/ubereats_showcase/1.png)
![](/images/ubereats_showcase/2.png)
![](https://i.imgur.com/kqisznC.png)
![](/images/ubereats_showcase/7.png)
![](/images/ubereats_showcase/8.png)
![](/images/ubereats_showcase/9.png)
![](/images/ubereats_showcase/image-2.png)



**W aplikacji Uber Eats można wyszczególnić następujące rzeczy:**

</div>

* Podczas akceptacji wyświetlany jest adres dostawy i stawka za kurs. **Warto zwrócić uwagę, że ponoć kursy są bardziej wyceniane pod względem czasu jego realizacji aniżeli dystansu.**
* Lista produktów wraz z numerem zamówienia.
* Możliwość Nie przyjmowania kolejnych zamówień
* Questy (możliwość dodatkowego zarobku po spełnieniu danych wymagań)
* Statystyki przychodów, tu trzeba mieć na uwadzę, że stawki są podane wraz z podatkiem, więc od zarobionej kwoty należy odejmować pozycje PODATKI

<div style="text-align:center">

## Obszary wysokiego zapotrzebowania

![](/images/ubereats_showcase/5.png)
</div>

* Na mapie w zależności od miasta, mogą wyświetlać się “domki”, jest to informacja o zapotrzebowaniu na kurierach w danej restauracji / obszarze. Aktualizacja tego zmienia się co około 5 minut
  {{<alert context="warning" text="Niestety zazwyczaj ten obszar wysokiego zapotrzebowania nie ma nic wspólnego z rzeczywistością. Nie gwarantuje nam to zamówienia jeżeli będziemy siedzieć w jego miejscu"/>}} 
<div style="text-align:center">


## Problemy z aplikacją
![](/images/ubereats_showcase/appproblem.png)
![](/images/ubereats_showcase/6.png)
![](/images/ubereats_showcase/image61.png)
![](/images/ubereats_showcase/needs_attention.png)
</div>


W przypadku gdy w aplikacji widnieje błąd podczas próby zalogowania się typu:
### Pojazd jest zajęty
{{<alert context="light" text="Należy skontaktować się z supportem Ubera, poprzez aplikacje lub wejść w [podany link](https://help.uber.com/driving-and-delivering/article/nie-mo%C5%BCna-zalogowa%C4%87-si%C4%99-w-celu-realizowania-przejazd%C3%B3w?nodeId=4dccdd1e-b800-4140-a9b9-f00885b069ca)"/>}}
### Prześlij plik Poland Driver’s License

{{% alert context="light" %}}

W przypadku tego błędu należy skontaktować się z partnerem flotowym aby przełączył Twoje konto na rower. Można również spróbować w aplikacji wejść w: 
> Pomoc -> Konto i Aplikacja -> Zmiana ustawień konta -> Konfiguracja konta kierowcy i dostawcy
W przypadku kiedy chcesz jeździć skuterem lub autem należy przesłać dokument prawa jazdy według tego co wyświetla aplikacja. 

{{% /alert %}}

{{<alert context="warning" text="Jeżeli chcesz jeździć skuterem, a kwalifikujesz się do jazdy na dowód osobisty (urodziłeś się przed 1995r) to niestety według Ubera musisz mieć prawo jazdy"/>}}

### Dostaję bardzo mało zamówień / Nie dostaję zamówień / Inni dostają więcej zamówień
Powodów może byc mnóstwo tego typu problemu. Wszystko zależy od miasta, pory roku, dnia, czy jest to dzień roboczy, gdzie stoisz itd. Wśród dostawców krąży mit odnośnie otrzymywania większej ilości zamówień przez osoby które mają zaznaczony środek transportu jako skuter / auto. To jest prawda. Sam Uber twierdzi, że to jest nieprawda lecz praktyka pokazuje często inaczej. Wynika to z działania algorytmu Ubera*. Algorytm "spasowuje" czas kiedy zamówienie będzie zrealizowane przez restauracje z czasem kiedy kurier przyjedzie na miejsce - najczęściej te czasy pokrywają się właśnie dla osób które jeżdżą skuterem/autem i będą od restauracji 3 - 5 minut drogi. W momencie gdy poruszasz się rowerem, nawigacja widzi że jesteś "<1 minuta" drogi od restauracji - żadna restauracja nie zaznaczy, że zamówienie będzie gotowe za tyle czasu.

{{<figure src="https://i.imgur.com/GYpTk5F.png" title="Czas dojazdu wg. mapy dla auta">}}

{{<figure src="https://i.imgur.com/syk3Iw9.png" title="Czas dojazdu wg. mapy dla roweru">}}

 \**sposób działania algorytmu jest oparty na domysłach i własnych obserwacji*

 Więc jak możemy zaobserwować - z tego samego miejsca oczekiwania auto bardziej "realnie" pokryje się z czasem przygotowania zamówienia oraz przyjazdem kuriera niż ten na rowerze.

 ### Jak mogę realizować zamówienia w innym mieście?

 Jeżeli chcemy spróbować swoich sił w innym mieście niż tym w którym mieszkamy - możemy to na Uber Eats zrobić bez problemu. W przypadku tej aplikacji wystarczy po prostu przetransportować się do innego miasta i zalogować. Zamówienia powinny być nam przypisywane. Problem pojawia się w momencie wynagrodzenia. Robiąc w ten sposób nie będziemy mieli nakładanych mnożników do wynagrodzenia. Jeżeli mimo wszyskto zdecydujemy się na jazdę bez mnożników to system wykryje i w ciągu 48h powinien nam zaaktualizować informacje w profilu i dodać mnożniki do miasta w którym jeździliśmy.

 Jeżeli chcemy uniknąć takiej sytuacji i mamy wszystko zaplanowane - możemy zgłosić zmianę miasta przez support. 
 
 Musimy wejść w: ``Pomoc -> Aplikacja -> Zmiana ustawień konta -> Chcę dostarczać w nowym mieście``

{{<alert context="danger" text="Sposób nie zadziała w przypadku jeżdzenia w **INNYM KRAJU** - do tego jest potrzebne nowe konto Uber Eats. Więcej informacji brak."/>}}

{{<alert context="warning" text="Gdy support zrobi Wam zmiane miasta to niestety oferta mnożników oraz bonusów z poprzedniego miasta znika"/>}}

 {{<alert context="info" text="Na Uber Eats wystarczy, że wykonamy czynności wymienione powyżej, nie musimy tworzyć żadnego dodatkowego konta ani nic z tych rzeczy. Oznacza to, że zarobione pieniądze z nowego miasta trafią w to samo rozliczenie co nasze standardowe miasto. Nic więcej nie musimy robić"/>}}

 ### Regiony dla miast

 W Uber Eats mniejsze miasta są podpięte pod większe. Dlatego np. w **Zakopanem** kurier może jeździć na koncie gdzie ma aktywne miasto **Kraków**. Wystarczy, że po prostu pojedzie i zaloguje się w tym mieście. Mowa tutaj oczywiście o questach jeżeli takowe istnieją.

 Więcej regionów dla innych miast:

 * Rybnik - dla Silesi
 * Przemyśl - dla Rzeszowa
 * Ostrów Wielkopolski - dla Kalisza
 * Zakopane - dla Krakowa

 ### Nowe miasta na Uber Eats

 Od **27.05.2025** Uber Eats dodał do swoich usług nowe miasta takie jak:

 * Piła
 * Wałbrzych
 * Grudziądz
 * Kołobrzeg

### Pełna lista miast

- Aleksandrów Łódzki
- Andrespol
- Belchatów
- Będzin
- Białystok
- Biesiekierz
- Bieruń
- Bielsko-Biała
- Błonie
- Błonie gmina
- Bolesławiec
- Bolesławiec gmina
- Bytom
- Bydgoszcz
- Chorzów
- Czechowice-Dziedzice
- Czeladź
- Czernica
- Częstochowa
- Dąbrowa Górnicza
- Dobra (Szczecińska)
- Dopiewo
- Dzierżoniów
- Elbląg
- Ełk
- Gdańsk
- Gdynia
- Gliwice
- Głogów
- Głogów gmina
- Głusk
- Gmina Grodzisk Mazowiecki
- Gmina Mińsk Mazowiecki
- Gmina Ożarów Mazowiecki
- Gmina Piaseczno
- Gmina Pruszcz Gdański
- Gmina Siedlce
- Gmina Sochaczew
- Gniezno
- Gorzów Wielkopolski
- Grodzisk Mazowiecki
- Grudziądz
- Halinów gmina
- Inowrocław
- Jabłonna
- Jaktorów
- Jastrzębie-Zdrój
- Jaworzno
- Jelenia Góra
- Józefów
- Juchnowiec Kościelny
- Kalisz
- Karczew
- Katowice
- Kąty Wrocławskie
- Kielce
- Knurów
- Kobierzyce
- Kobyłka
- Kolbudy
- Kołbaskowo
- Kołobrzeg
- Kołobrzeg gmina
- Komorniki
- Konin
- Konstancin-Jeziorna
- Konstancin-Jeziorna gmina
- Kosakowo
- Koszalin
- Kraków
- Ksawerów
- Legnica
- Legnickie Pole
- Legionowo
- Lędziny
- Leszno
- Lesznowola
- Liszki
- Lubin
- Luboń
- Lublin
- Łomża
- Łomianki
- Łódź
- Marki
- Mielec
- Michałowice
- Mikołów
- Milanówek
- Mińsk Mazowiecki
- Mogilany
- Morawica
- Mysłowice
- Nadarzyn
- Nieporęt
- Nowy Sącz
- Nysa
- Olsztyn
- Opole
- Opatówek
- Osieczna gmina
- Ostrów Wielkopolski
- Otwock
- Ożarów Mazowiecki
- Pabianice
- Pawłowice
- Piastów
- Piaseczno
- Piekary Śląskie
- Piła
- Piotrków Trybunalski
- Płock
- Podkowa Leśna
- Poznań
- Pruszcz Gdański
- Pruszków
- Przodkowo
- Przemyśl
- Radom
- Radzionków
- Raszyn
- Reda
- Ruda Śląska
- Rumia
- Rybnik
- Rzeszów
- Siemianowice Śląskie
- Siechnice gmina
- Sitkówka-Nowiny
- Skarszewy
- Skierniewice
- Słupsk
- Sochaczew
- Sopot
- Sosnowiec
- Stare Babice
- Stare Miasto
- Stargard
- Starogard Gdański
- Stawiguda
- Suchy Las
- Sulejówek
- Suwałki
- Swarzędz
- Świętochłowice
- Świeciechowa
- Swidnik
- Świnoujście
- Szczecin
- Tarnów
- Tarnów gmina
- Tarnowo Podgórne
- Tarnowskie Góry
- Tczew
- Turośń Kościelna
- Turawa
- Tychy
- Warszawa
- Wałbrzych
- Wasilków
- Wejherowo
- Wieliczka gmina
- Wieliszew
- Wisznia Mała
- Włocławek
- Wołomin
- Wrocław
- Wiązowna
- Zakopane
- Zakroczym
- Zabrze
- Ząbki
- Zamość
- Zbrosławice
- Zielona Góra
- Zielonka
- Zielonki
- Żory
- Żyrardów
