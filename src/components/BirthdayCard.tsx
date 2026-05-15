/**
 * Componente: Aniversariantes do Mês e da Semana
 * Mostra membros que fazem aniversário no mês atual e na semana atual
 * Design profissional e festivo
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, MessageCircle, Cake, Sparkles, Calendar, Clock } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  phone: string | null;
  birth_date: string | null;
  photo_url: string | null;
}

interface BirthdayCardProps {
  members: Member[];
}

interface BirthdayMember {
  member: Member;
  day: number;
  month: number;
  fullDate: Date;
  daysUntil: number;
  isToday: boolean;
  isThisWeek: boolean;
}

export default function BirthdayCard({ members }: BirthdayCardProps) {
  // Processar aniversariantes
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = today.getMonth() + 1;

  const birthdays: BirthdayMember[] = [];

  members.forEach(member => {
    if (!member.birth_date) return;

    const birthDate = new Date(member.birth_date);
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;

    // Calcular dias até o aniversário
    const nextBirthday = new Date(today.getFullYear(), month - 1, day);
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const daysUntil = Math.floor((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isToday = daysUntil === 0;
    const isThisWeek = daysUntil >= 0 && daysUntil <= 6;

    birthdays.push({
      member,
      day,
      month,
      fullDate: nextBirthday,
      daysUntil,
      isToday,
      isThisWeek,
    });
  });

  // Filtrar aniversariantes da semana (próximos 7 dias)
  const weekBirthdays = birthdays
    .filter(b => b.isThisWeek)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // Filtrar aniversariantes do mês atual
  const monthBirthdays = birthdays
    .filter(b => b.month === currentMonth)
    .sort((a, b) => a.day - b.day);

  // Enviar parabéns por WhatsApp
  const handleWhatsAppBirthday = (member: Member) => {
    if (!member.phone) {
      window.open(`https://wa.me/search?text=${encodeURIComponent('Feliz aniversário! 🎂🎉')}`, '_blank');
      return;
    }

    const phone = member.phone.replace(/\D/g, '');
    const message = `Feliz aniversário ${member.name}! 🎂🎉 Que Deus te abençoe grandemente!`;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                     'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  // Cores do gradiente baseadas na quantidade (com suporte a modo escuro)
  const weekGradientClass = weekBirthdays.length === 1
    ? 'from-green-50 via-emerald-50 to-teal-50 border-green-200 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 dark:border-green-800'
    : weekBirthdays.length <= 3
      ? 'from-orange-50 via-pink-50 to-purple-50 border-orange-200 dark:from-orange-900/30 dark:via-pink-900/30 dark:to-purple-900/30 dark:border-orange-800'
      : 'from-blue-50 via-purple-50 to-pink-50 border-blue-200 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 dark:border-blue-800';

  const monthGradientClass = monthBirthdays.length === 1
    ? 'from-pink-50 via-purple-50 to-blue-50 border-pink-200 dark:from-pink-900/30 dark:via-purple-900/30 dark:to-blue-900/30 dark:border-pink-800'
    : monthBirthdays.length <= 3
      ? 'from-orange-50 via-pink-50 to-purple-50 border-orange-200 dark:from-orange-900/30 dark:via-pink-900/30 dark:to-purple-900/30 dark:border-orange-800'
      : 'from-blue-50 via-purple-50 to-pink-50 border-blue-200 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 dark:border-blue-800';

  return (
    <>
      {/* Aniversariantes da Semana */}
      {weekBirthdays.length > 0 && (
        <Card className={`border-2 ${weekGradientClass} shadow-lg mb-8 animate-in fade-in duration-500`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex items-center gap-2">
                  <Clock className="w-7 h-7 text-orange-600 dark:text-orange-400 animate-pulse" />
                  <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 dark:from-orange-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">
                    🎉 Aniversariantes da Semana
                  </span>
                  <Sparkles className="w-5 h-5 text-yellow-500 dark:text-yellow-400 animate-pulse" />
                </div>
              </CardTitle>
              <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 text-sm font-semibold shadow-md">
                <Calendar className="w-4 h-4 mr-2" />
                {weekBirthdays.length} {weekBirthdays.length === 1 ? 'Aniversariante' : 'Aniversariantes'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">
              Vamos celebrar nos próximos 7 dias! 🎊
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weekBirthdays.map((birthday, index) => {
                const bgColors = [
                  'from-green-100 to-green-50 border-green-200 dark:from-green-900/40 dark:to-green-900/20 dark:border-green-800',
                  'from-orange-100 to-orange-50 border-orange-200 dark:from-orange-900/40 dark:to-orange-900/20 dark:border-orange-800',
                  'from-pink-100 to-pink-50 border-pink-200 dark:from-pink-900/40 dark:to-pink-900/20 dark:border-pink-800',
                  'from-purple-100 to-purple-50 border-purple-200 dark:from-purple-900/40 dark:to-purple-900/20 dark:border-purple-800',
                ];
                const colorClass = bgColors[index % bgColors.length];

                return (
                  <div
                    key={birthday.member.id}
                    className={`group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${colorClass} border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {birthday.member.photo_url ? (
                          <img
                            src={birthday.member.photo_url}
                            alt={birthday.member.name}
                            className={`w-14 h-14 rounded-full object-cover border-2 shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                              birthday.isToday
                                ? 'border-yellow-500'
                                : 'border-pink-500'
                            }`}
                          />
                        ) : (
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                            birthday.isToday
                              ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500'
                              : 'bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500'
                          }`}>
                            <span className="text-2xl font-bold text-white">{birthday.day}</span>
                          </div>
                        )}
                        {birthday.isToday && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                            <Cake className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          {birthday.isToday ? '🎂 ' : '🎉 '}{birthday.member.name}
                        </p>
                        <span className="text-sm flex items-center gap-2 flex-wrap">
                          {birthday.isToday ? (
                            <Badge className="bg-red-500 text-white animate-pulse">
                              <Cake className="w-3 h-3 mr-1" />
                              É HOJE!
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-600 dark:border-orange-400">
                              <Clock className="w-3 h-3 mr-1" />
                              Em {birthday.daysUntil} {birthday.daysUntil === 1 ? 'dia' : 'dias'}
                            </Badge>
                          )}
                          <span className="text-gray-600 dark:text-gray-400">
                            {birthday.day} de {monthNames[birthday.month - 1]}
                          </span>
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWhatsAppBirthday(birthday.member)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 dark:from-green-600 dark:to-emerald-600"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Parabenizar no WhatsApp
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aniversariantes do Mês */}
      {monthBirthdays.length > 0 && (
        <Card className={`border-2 ${monthGradientClass} shadow-lg mb-8 animate-in fade-in duration-500`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex items-center gap-2">
                  <Cake className="w-7 h-7 text-pink-600 dark:text-pink-400 animate-pulse" />
                  <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 dark:from-pink-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent font-bold">
                    🎂 Aniversariantes do Mês
                  </span>
                  <Sparkles className="w-5 h-5 text-yellow-500 dark:text-yellow-400 animate-pulse" />
                </div>
              </CardTitle>
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 text-sm font-semibold shadow-md">
                <Gift className="w-4 h-4 mr-2" />
                {monthBirthdays.length} {monthBirthdays.length === 1 ? 'Aniversariante' : 'Aniversariantes'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">
              Vamos celebrar e parabenizar nossos irmãos que fazem aniversário neste mês! 🎉
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthBirthdays.map((birthday, index) => {
                const bgColors = [
                  'from-pink-100 to-pink-50 border-pink-200 dark:from-pink-900/40 dark:to-pink-900/20 dark:border-pink-800',
                  'from-purple-100 to-purple-50 border-purple-200 dark:from-purple-900/40 dark:to-purple-900/20 dark:border-purple-800',
                  'from-blue-100 to-blue-50 border-blue-200 dark:from-blue-900/40 dark:to-blue-900/20 dark:border-blue-800',
                  'from-orange-100 to-orange-50 border-orange-200 dark:from-orange-900/40 dark:to-orange-900/20 dark:border-orange-800',
                ];
                const colorClass = bgColors[index % bgColors.length];

                return (
                  <div
                    key={birthday.member.id}
                    className={`group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${colorClass} border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {birthday.member.photo_url ? (
                          <img
                            src={birthday.member.photo_url}
                            alt={birthday.member.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-pink-500 shadow-lg group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-2xl font-bold text-white">{birthday.day}</span>
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-md animate-pulse">
                          <Cake className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <div>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          🎉 {birthday.member.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Gift className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                          {birthday.day} de {monthNames[birthday.month - 1]}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWhatsAppBirthday(birthday.member)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 dark:from-green-600 dark:to-emerald-600"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Parabenizar no WhatsApp
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                Não esqueça de enviar uma mensagem de carinho e orar por eles!
                <Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há aniversariantes */}
      {weekBirthdays.length === 0 && monthBirthdays.length === 0 && (
        <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 mb-8">
          <CardContent className="py-8">
            <div className="text-center">
              <Cake className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">Nenhum aniversariante nesta semana ou neste mês</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Que tal cadastrar as datas de nascimento dos membros? 🎂
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
