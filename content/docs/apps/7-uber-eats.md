---
weight: 8
title: "Aplikacja Uber Eats"
description: "Specyfikacja aplikacji Uber Eats"
icon: "article"
date: "2024-04-26T13:08:32+02:00"
lastmod: "2024-04-26T13:08:32+02:00"
draft: false
toc: true
---

<div style="text-align:center">

![](/images/uber.png)

# Informacje ogólne o aplikacji

</div>

Uber Eats to nasza platforma, dzięki której zamawianie jedzenia z Twoich ulubionych lokalnych restauracji jest teraz równie łatwe, jak zamówienie przejazdu.
Dzięki aplikacji Uber Eats masz w zasięgu ręki szereg lokalnych restauracji i serwowanych przez nie dań. Możesz w każdej chwili zamówić dowolne danie z całego menu.
Aplikacja UBER EATS ma dwie wersje: dla klientów i dla kurierów. Klienci mogą wybierać spośród różnych opcji gastronomicznych, płacić za zamówienia online i śledzić status dostawy na mapie. Aplikacja dla kurierów ma nazwe Uber Driver i jest do pobrania na urządzenia [Android](https://play.google.com/store/apps/details?id=com.ubercab.driver&hl=pl&gl=US) oraz [iOS](https://apps.apple.com/pl/app/uber-driver-drive-deliver/id1131342792). 

{{<alert context="info" text="Aplikacja **[Uber Driver](https://play.google.com/store/apps/details?id=com.ubercab.driver)** jest używana zarówno do usług dostaw jedzenia jak i taxi, nie ma osobnych aplikacji."/>}}

### [FAQ - Uber Eats](https://www.uber.com/pl/pl/deliver/basics/)

<div style="text-align:center">

## Plusy i minusy aplikacji

</div>

{{% alert icon="🟢"context="success" %}}

### Plusy:
* Pracujesz kiedy chcesz i jak chcesz (offslot)
* Dowolność w przyjmowaniu zamówień
* Spoko stawki ***(W lato najczęściej mają najwyższe ze wszystkich aplikacji)***
* Questy
* Częste i wysokie napiwki
  
{{% /alert %}}

{{% alert icon="🔴"context="danger" %}}

### Minusy:

* Brak widoczności dystansu i stawki za kurs
* Brak widoczności gdzie się dostarcza (informacja pojawia się dopiero po odbiorze zamówienia)
* Brak dopłaty za dojazd do restauracji
* Brak ciągłości zamówień
* Zgłaszanie problemów do supportu
* Często daleki dojazd
* **Mniejsza ilość kursów dla pojazdu typu ROWER**
{{% /alert %}}

{{<alert context="info" text="Uber Eats wyświetla zarobki w kwotach **BRUTTO** - należy zarobioną kwotę podzielić przez 1.23 aby uzyskać kwotę netto"/>}}

<div style="text-align:center">

## Prezentacja aplikacji


![](/images/ubereats_showcase/1.png)
![](/images/ubereats_showcase/2.png)
![](/images/ubereats_showcase/4.png)
![](/images/ubereats_showcase/7.png)
![](/images/ubereats_showcase/8.png)
![](/images/ubereats_showcase/9.png)



**W aplikacji Uber Eats można wyszczególnić następujące rzeczy:**

</div>

* Podczas akceptacji zamówienia, wyświetlany jest mnożnik i zaznaczone miejsce odbioru z restauracji (najbliższa trasa od punktu obecnego do restauracji)
* Lista produktów wraz z numerem zamówienia.
* Możliwość Nie przyjmowania kolejnych zamówień
* Questy (możliwość dodatkowego zarobku po spełnieniu danych wymagań)
* Statystyki przychodów, tu trzeba mieć na uwadzę, że stawki są podane wraz z podatkiem, więc od zarobionej kwoty należy odejmować pozycje PODATKI

<div style="text-align:center">

## Przykład stref i zwiększenie przychodów

![](/images/ubereats_showcase/10.png)
![](/images/ubereats_showcase/5.png)
![](/images/ubereats_showcase/zones.png)
</div>

* Na mapie w zależności od miasta, mogą wyświetlać się “domki”, jest to informacja o zapotrzebowaniu na kurierach w danej restauracji / obszarze. Aktualizacja tego zmienia się co około 5 minut
  {{<alert context="warning" text="Niestety zazwyczaj ten obszar wysokiego zapotrzebowania nie ma nic wspólnego z rzeczywistością. Nie gwarantuje nam to zamówienia jeżeli będziemy siedzieć w jego miejscu"/>}} 
* Również na mapie sa wyszczególnione obszary w danym miescie, jakie w danym momencie obowiązują mnożniki za zamówienie.
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


### [PARTNER] Wpis do CEIDG/KRS
{{%alert context="light" %}}

Należy skontaktować się ze swoim partnerem rozliczeniowym aby dodał do floty.

Jeżeli jesteś użytkownikiem naszego serwera Discord **Dexterawka**, możesz poprosić o zaproszenie do floty [na tym kanale](https://discord.com/channels/1003287844825075762/1049309845448314900) wybierając opcje ``Zaproszenie do floty Uber Eats``. Musisz uzupełnić w następnym oknie swój adres e-mail oraz numer telefonu którego użyłeś do rejestracji konta na Uber Eats.

*Te informacje widzą tylko pracownicy floty Evelstar, oraz administracja/moderacja serwera*.

{{% /alert %}}

### Nie zrobiłem żadnego zamówienia, a zostałem rozliczony z aplikacji Uber Eats

To jest bardzo częsty przypadek, ponieważ aplikacja Uber Eats jest pod tym względem delikatnie mówiąc źle zrobiona. Dopłaty za dojazd do restauracji są wypłacane w czwartek następnego tygodnia. Zazwyczaj są to groszowe sprawy, partner potem widząc przychód na aplikacji i tak i tak ją rozliczy i jesteśmy na minusie z rozliczeniem bo prowizja została pobrana mimo, że nie jeździliśmy na aplikacji Uber Eats. 

<center>

{{<figure src="https://i.imgur.com/hG5r3pi.png" width="25%" caption="Tak wygląda rozliczenie w momencie gdy wypłacona jest opłata za dojazd do restauracji. Jak widzicie jest to całe 1.30zł brutto, a nie zrobiłem ani jednego zamówienia">}}

</center>

**Rozwiązanie dla kurierów [Evelstar](https://evelstar.com):** Należy zgłosić reklamację rozliczenia w takim wypadku. Trzeba napisać maila na **[rozliczenia@evelstar.com](mailto:rozliczenia@evelstar.com)** i poprosić o zwrot prowizji, ponieważ nie wykonaliśmy ani jednego zamówienia. Należy to zrobić w ciągu 30 dni. Po tym okresie czasu nasza reklamacja nie zostanie uwzględniona.

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

{{<alert context="warning" text="Gdy support zrobi Wam zmiane miasta to niestety oferta mnożników oraz bonusów z poprzedniego miasta znika"/>}}

 {{<alert context="info" text="Na Uber Eats wystarczy, że wykonamy czynności wymienione powyżej, nie musimy tworzyć żadnego dodatkowego konta ani nic z tych rzeczy. Oznacza to, że zarobione pieniądze z nowego miasta trafią w to samo rozliczenie co nasze standardowe miasto. Nic więcej nie musimy robić"/>}}

 

